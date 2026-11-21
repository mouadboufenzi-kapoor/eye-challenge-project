export interface EyeState {
  leftClosed: boolean
  rightClosed: boolean
  confidence: number
  faceDetected: boolean
  leftBlink: number
  rightBlink: number
  threshold: number
  fps: number
}

export interface EyeTracker {
  start(): Promise<void>
  stop(): void
  onUpdate(cb: (state: EyeState) => void): void
  preload?(): Promise<void>
}
