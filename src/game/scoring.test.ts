import { describe, expect, it } from 'vitest'
import { DEFAULT_GAME_CONFIG } from './config'
import { updateScore, type ScoreState } from './scoring'

const initialScore: ScoreState = { value: 0, closedSinceMs: null }

describe('updateScore', () => {
  it('increases the score when the player is open and the character is closed', () => {
    const result = updateScore(
      initialScore,
      true,
      'closed',
      1000,
      1000,
      DEFAULT_GAME_CONFIG,
    )

    expect(result.value).toBe(DEFAULT_GAME_CONFIG.scoreIncreasePerSecond)
    expect(result.closedSinceMs).toBeNull()
  })

  it('waits before decreasing the score while the player remains closed', () => {
    const first = updateScore(
      initialScore,
      false,
      'open',
      1000,
      1000,
      DEFAULT_GAME_CONFIG,
    )
    const second = updateScore(
      first,
      false,
      'open',
      1000,
      DEFAULT_GAME_CONFIG.eyesClosedDecayDelayMs + 1000,
      DEFAULT_GAME_CONFIG,
    )

    expect(first.value).toBe(0)
    expect(second.value).toBe(0)
  })

  it('decreases the score after the closed-eyes delay', () => {
    const state: ScoreState = {
      value: 50,
      closedSinceMs: 0,
    }

    const result = updateScore(
      state,
      false,
      'open',
      1000,
      DEFAULT_GAME_CONFIG.eyesClosedDecayDelayMs + 1000,
      DEFAULT_GAME_CONFIG,
    )

    expect(result.value).toBe(40)
  })
})
