import type { GameConfig } from './config'

export interface ScoreState {
  value: number
  closedSinceMs: number | null
}

export function updateScore(
  score: ScoreState,
  playerEyesOpen: boolean,
  characterEyes: 'open' | 'closed',
  deltaMs: number,
  elapsedMs: number,
  config: GameConfig,
): ScoreState {
  const deltaSeconds = Math.max(0, deltaMs) / 1000

  if (playerEyesOpen && characterEyes === 'closed') {
    return {
      value: clamp(score.value + deltaSeconds * config.scoreIncreasePerSecond, 0, config.scoreToWin),
      closedSinceMs: null,
    }
  }

  if (!playerEyesOpen) {
    const closedSinceMs = score.closedSinceMs ?? elapsedMs
    const decayStarted = elapsedMs - closedSinceMs >= config.eyesClosedDecayDelayMs
    return {
      value: clamp(
        score.value - (decayStarted ? deltaSeconds * config.scoreDecreasePerSecond : 0),
        0,
        config.scoreToWin,
      ),
      closedSinceMs,
    }
  }

  return { ...score, closedSinceMs: null }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
