import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
} from '@mediapipe/tasks-vision'
import type { EyeState, EyeTracker } from './eyeTracker'
import { cameraErrorCode } from './cameraErrors'

export interface EyeTrackerConfig {
  width: number
  height: number
  targetFps: number
  smoothingFrames: number
  stateConfirmationFrames: number
  closeThreshold: number
  openThreshold: number
}

export const DEFAULT_EYE_TRACKER_CONFIG: EyeTrackerConfig = {
  width: 640,
  height: 480,
  targetFps: 30,
  smoothingFrames: 6,
  stateConfirmationFrames: 2,
  closeThreshold: 0.5,
  openThreshold: 0.35,
}

const EMPTY_STATE: EyeState = {
  leftClosed: false,
  rightClosed: false,
  confidence: 0,
  faceDetected: false,
  leftBlink: 0,
  rightBlink: 0,
  threshold: DEFAULT_EYE_TRACKER_CONFIG.closeThreshold,
  fps: 0,
}

export class MediaPipeEyeTracker implements EyeTracker {
  private readonly config: EyeTrackerConfig
  private readonly video: HTMLVideoElement
  private readonly listeners = new Set<(state: EyeState) => void>()
  private landmarker: FaceLandmarker | null = null
  private stream: MediaStream | null = null
  private animationFrame = 0
  private lastFrameAt = 0
  private lastTimestamp = -1
  private running = false
  private closed = { left: false, right: false }
  private threshold = DEFAULT_EYE_TRACKER_CONFIG.closeThreshold
  private openThreshold = DEFAULT_EYE_TRACKER_CONFIG.openThreshold
  private closedFrames = { left: 0, right: 0 }
  private openFrames = { left: 0, right: 0 }
  private leftHistory: number[] = []
  private rightHistory: number[] = []
  private frameTimes: number[] = []
  private state: EyeState = EMPTY_STATE
  private landmarkerPromise: Promise<FaceLandmarker> | null = null

  constructor(video: HTMLVideoElement, config: Partial<EyeTrackerConfig> = {}) {
    this.video = video
    this.config = { ...DEFAULT_EYE_TRACKER_CONFIG, ...config }
    this.threshold = this.config.closeThreshold
    this.openThreshold = this.config.openThreshold
  }

  async start(): Promise<void> {
    if (this.running) return
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('CAMERA_UNSUPPORTED')

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: 'user' },
          width: { ideal: this.config.width },
          height: { ideal: this.config.height },
          frameRate: { ideal: this.config.targetFps, max: this.config.targetFps },
        },
      })
    } catch (error) {
      console.error('Unable to access the camera', error)
      throw new Error(cameraErrorCode(error))
    }

    this.video.srcObject = this.stream
    this.video.muted = true
    this.video.playsInline = true
    await this.video.play()

    this.landmarker = await this.ensureLandmarker()
    this.running = true
    this.lastFrameAt = 0
    this.emit({ ...EMPTY_STATE, threshold: this.threshold })
    this.scheduleFrame()
  }

  stop(): void {
    this.running = false
    cancelAnimationFrame(this.animationFrame)
    this.stream?.getTracks().forEach((track) => track.stop())
    this.stream = null
    if (this.landmarker) {
      this.landmarker.close()
    } else {
      void this.landmarkerPromise?.then((landmarker) => landmarker.close())
    }
    this.landmarker = null
    this.video.srcObject = null
    this.leftHistory = []
    this.rightHistory = []
    this.frameTimes = []
    this.closedFrames = { left: 0, right: 0 }
    this.openFrames = { left: 0, right: 0 }
    this.landmarkerPromise = null
  }

  async preload(): Promise<void> {
    await this.ensureLandmarker()
  }

  private async ensureLandmarker(): Promise<FaceLandmarker> {
    if (this.landmarker) return this.landmarker
    if (!this.landmarkerPromise) {
      this.landmarkerPromise = FilesetResolver.forVisionTasks('/wasm').then((vision) =>
        this.createLandmarker(vision),
      )
    }
    return this.landmarkerPromise
  }

  onUpdate(cb: (state: EyeState) => void): void {
    this.listeners.add(cb)
  }

  calibrate(openAverage: number, closedAverage: number): void {
    const range = closedAverage - openAverage
    const hasUsefulCalibration = Number.isFinite(range) && range >= 0.08
    const openReference = hasUsefulCalibration ? openAverage : this.config.openThreshold
    const personalRange = hasUsefulCalibration
      ? range
      : this.config.closeThreshold - this.config.openThreshold

    this.openThreshold = Math.min(0.8, Math.max(0.05, openReference + personalRange * 0.25))
    this.threshold = Math.min(0.95, Math.max(
      this.openThreshold + 0.05,
      openReference + personalRange * 0.6,
    ))
    this.closed = { left: false, right: false }
    this.closedFrames = { left: 0, right: 0 }
    this.openFrames = { left: 0, right: 0 }
    this.state = { ...this.state, threshold: this.threshold }
    this.emit(this.state)
  }

  private async createLandmarker(
    vision: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>,
  ): Promise<FaceLandmarker> {
    const options = {
      baseOptions: {
        modelAssetPath: '/models/face_landmarker.task',
        delegate: 'GPU' as const,
      },
      runningMode: 'VIDEO' as const,
      numFaces: 1,
      outputFaceBlendshapes: true,
      minFaceDetectionConfidence: 0.5,
      minFacePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    }
    try {
      return await FaceLandmarker.createFromOptions(vision, options)
    } catch (gpuError) {
      console.warn('GPU delegate unavailable, retrying with CPU', gpuError)
      return FaceLandmarker.createFromOptions(vision, {
        ...options,
        baseOptions: { ...options.baseOptions, delegate: 'CPU' },
      })
    }
  }

  private scheduleFrame = (): void => {
    if (!this.running) return
    this.animationFrame = requestAnimationFrame(() => void this.processFrame())
  }

  private async processFrame(): Promise<void> {
    if (!this.running || !this.landmarker || this.video.readyState < 2) {
      this.scheduleFrame()
      return
    }
    const now = performance.now()
    if (now - this.lastFrameAt < 1000 / this.config.targetFps) {
      this.scheduleFrame()
      return
    }
    this.lastFrameAt = now
    try {
      const timestamp = now > this.lastTimestamp ? now : this.lastTimestamp + 1
      const result = this.landmarker.detectForVideo(this.video, timestamp)
      this.lastTimestamp = timestamp
      this.updateFromResult(result, now)
    } catch (error) {
      console.error('Face landmark detection failed', error)
    }
    this.scheduleFrame()
  }

  private updateFromResult(result: FaceLandmarkerResult, now: number): void {
    const categories = result.faceBlendshapes[0]?.categories
    const leftBlink = categories?.find((category) => category.categoryName === 'eyeBlinkLeft')?.score ?? 0
    const rightBlink = categories?.find((category) => category.categoryName === 'eyeBlinkRight')?.score ?? 0
    const faceDetected = result.faceLandmarks.length > 0
    const averageLeft = this.pushAndAverage(this.leftHistory, leftBlink)
    const averageRight = this.pushAndAverage(this.rightHistory, rightBlink)

    this.updateEyeState('left', averageLeft)
    this.updateEyeState('right', averageRight)

    this.frameTimes.push(now)
    while (this.frameTimes[0] !== undefined && now - this.frameTimes[0] > 1000) this.frameTimes.shift()
    this.emit({
      leftClosed: this.closed.left,
      rightClosed: this.closed.right,
      confidence: faceDetected ? 1 : 0,
      faceDetected,
      leftBlink,
      rightBlink,
      threshold: this.threshold,
      fps: this.frameTimes.length,
    })
  }

  private pushAndAverage(history: number[], value: number): number {
    history.push(value)
    if (history.length > this.config.smoothingFrames) history.shift()
    return history.reduce((sum, item) => sum + item, 0) / history.length
  }

  private updateEyeState(side: 'left' | 'right', average: number): void {
    if (average >= this.threshold) {
      this.closedFrames[side] += 1
      this.openFrames[side] = 0
      if (this.closedFrames[side] >= this.config.stateConfirmationFrames) {
        this.closed[side] = true
      }
      return
    }

    if (average <= this.openThreshold) {
      this.openFrames[side] += 1
      this.closedFrames[side] = 0
      if (this.openFrames[side] >= this.config.stateConfirmationFrames) {
        this.closed[side] = false
      }
      return
    }

    this.closedFrames[side] = 0
    this.openFrames[side] = 0
  }

  private emit(state: EyeState): void {
    this.state = state
    this.listeners.forEach((listener) => listener(state))
  }
}
