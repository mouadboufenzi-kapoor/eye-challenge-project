import { describe, expect, it } from 'vitest'
import { GameEngine } from './engine'

const config = {
  countdownMs: 100,
  lossOverlapToleranceMs: 150,
  scoreToWin: 10,
  scoreIncreasePerSecond: 20,
  eyesClosedDecayDelayMs: 3000,
  scoreDecreasePerSecond: 10,
  characterOpenDurationMs: { min: 1000, max: 1000 },
  characterClosedDurationMs: { min: 1000, max: 1000 },
}

describe('GameEngine', () => {
  it('moves from calibration to countdown and then to playing', () => {
    const engine = new GameEngine(config)

    engine.beginCalibration()
    expect(engine.getState().phase).toBe('calibration')

    engine.finishCalibration()
    expect(engine.getState().phase).toBe('countdown')

    engine.tick(100, { eyesOpen: false })
    expect(engine.getState().phase).toBe('playing')
  })

  it('loses only after the open-eyes overlap exceeds the tolerance', () => {
    const engine = new GameEngine(config)
    engine.beginCalibration()
    engine.finishCalibration()
    engine.tick(101, { eyesOpen: false })
    engine.tick(899, { eyesOpen: false })

    engine.tick(150, { eyesOpen: true })
    expect(engine.getState().phase).toBe('playing')
    engine.tick(1, { eyesOpen: true })
    expect(engine.getState().phase).toBe('lost')
  })

  it('wins when the score reaches the configured target', () => {
    const engine = new GameEngine({
      ...config,
      characterClosedDurationMs: { min: 10000, max: 10000 },
    })
    engine.beginCalibration()
    engine.finishCalibration()
    engine.tick(101, { eyesOpen: false })

    engine.tick(500, { eyesOpen: true })

    expect(engine.getState().phase).toBe('won')
    expect(engine.getState().score).toBe(10)
  })
})
