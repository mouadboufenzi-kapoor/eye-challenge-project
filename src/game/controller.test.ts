import { describe, expect, it } from 'vitest'
import { EyeGameController, type FrameScheduler } from './controller'
import { GameEngine } from './engine'
import type { EyeState, EyeTracker } from '../input/eyeTracker'

class FakeTracker implements EyeTracker {
  private listener: ((state: EyeState) => void) | null = null
  started = false
  stopped = false

  async start(): Promise<void> {
    this.started = true
  }

  stop(): void {
    this.stopped = true
  }

  onUpdate(callback: (state: EyeState) => void): void {
    this.listener = callback
  }

  publish(state: EyeState): void {
    this.listener?.(state)
  }
}

class FakeScheduler implements FrameScheduler {
  private callback: ((timestamp: number) => void) | null = null
  private nextId = 1

  request(callback: (timestamp: number) => void): number {
    this.callback = callback
    return this.nextId++
  }

  cancel(): void {
    this.callback = null
  }

  frame(timestamp: number): void {
    const callback = this.callback
    this.callback = null
    callback?.(timestamp)
  }
}

const openFace: EyeState = {
  leftClosed: false,
  rightClosed: false,
  confidence: 1,
  faceDetected: true,
  leftBlink: 0,
  rightBlink: 0,
  threshold: 0.5,
  fps: 30,
}

describe('EyeGameController', () => {
  it('converts an open detected face into game input', async () => {
    const tracker = new FakeTracker()
    const scheduler = new FakeScheduler()
    const engine = new GameEngine({
      countdownMs: 0,
      scoreToWin: 10,
      characterClosedDurationMs: { min: 10000, max: 10000 },
    })
    const controller = new EyeGameController(engine, tracker, scheduler)

    controller.beginCalibration()
    controller.finishCalibration()
    await controller.start()
    tracker.publish(openFace)
    scheduler.frame(0)
    scheduler.frame(500)

    expect(controller.getState().score).toBe(10)
    expect(controller.getState().phase).toBe('won')
    expect(tracker.started).toBe(true)
  })

  it('treats a missing face as closed eyes and stops cleanly', async () => {
    const tracker = new FakeTracker()
    const scheduler = new FakeScheduler()
    const engine = new GameEngine({ countdownMs: 0 })
    const controller = new EyeGameController(engine, tracker, scheduler)

    controller.beginCalibration()
    controller.finishCalibration()
    await controller.start()
    tracker.publish({ ...openFace, faceDetected: false })
    scheduler.frame(0)
    scheduler.frame(200)
    controller.stop()

    expect(controller.getState().score).toBe(0)
    expect(tracker.stopped).toBe(true)
  })

  it('resets the engine through the controller', () => {
    const tracker = new FakeTracker()
    const scheduler = new FakeScheduler()
    const engine = new GameEngine()
    const controller = new EyeGameController(engine, tracker, scheduler)

    controller.beginCalibration()
    controller.finishCalibration()
    controller.reset()

    expect(controller.getState().phase).toBe('idle')
    expect(controller.getState().score).toBe(0)
  })
})
