import type { EyeState, EyeTracker } from '../input/eyeTracker'
import { GameEngine, type GameState } from './engine'

export interface FrameScheduler {
  request(callback: (timestamp: number) => void): number
  cancel(id: number): void
}

export interface GameController {
  start(): Promise<void>
  stop(): void
  beginCalibration(): void
  finishCalibration(): void
  getState(): GameState
  onUpdate(callback: (state: GameState) => void): void
}

export class EyeGameController implements GameController {
  private readonly engine: GameEngine
  private readonly tracker: EyeTracker
  private readonly scheduler: FrameScheduler
  private readonly listeners = new Set<(state: GameState) => void>()
  private latestEyesOpen = false
  private lastTimestamp: number | null = null
  private frameId: number | null = null
  private running = false

  constructor(
    engine: GameEngine,
    tracker: EyeTracker,
    scheduler: FrameScheduler = browserFrameScheduler,
  ) {
    this.engine = engine
    this.tracker = tracker
    this.scheduler = scheduler
    this.tracker.onUpdate((state) => this.handleEyeState(state))
  }

  async start(): Promise<void> {
    if (this.running) return
    await this.tracker.start()
    this.running = true
    this.lastTimestamp = null
    this.scheduleNextFrame()
  }

  stop(): void {
    this.running = false
    if (this.frameId !== null) this.scheduler.cancel(this.frameId)
    this.frameId = null
    this.lastTimestamp = null
    this.tracker.stop()
  }

  beginCalibration(): void {
    this.engine.beginCalibration()
    this.emit()
  }

  finishCalibration(): void {
    this.engine.finishCalibration()
    this.emit()
  }

  getState(): GameState {
    return this.engine.getState()
  }

  onUpdate(callback: (state: GameState) => void): void {
    this.listeners.add(callback)
  }

  private handleEyeState(state: EyeState): void {
    this.latestEyesOpen = state.faceDetected && !state.leftClosed && !state.rightClosed
  }

  private scheduleNextFrame(): void {
    if (!this.running) return
    this.frameId = this.scheduler.request((timestamp) => this.update(timestamp))
  }

  private update(timestamp: number): void {
    if (!this.running) return
    const deltaMs = this.lastTimestamp === null ? 0 : Math.max(0, timestamp - this.lastTimestamp)
    this.lastTimestamp = timestamp
    this.engine.tick(deltaMs, { eyesOpen: this.latestEyesOpen })
    this.emit()
    this.scheduleNextFrame()
  }

  private emit(): void {
    const state = this.engine.getState()
    this.listeners.forEach((listener) => listener(state))
  }
}

const browserFrameScheduler: FrameScheduler = {
  request: (callback) => requestAnimationFrame(callback),
  cancel: (id) => cancelAnimationFrame(id),
}
