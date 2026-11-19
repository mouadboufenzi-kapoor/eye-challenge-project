export interface GameConfig {
  countdownMs: number
  lossOverlapToleranceMs: number
  scoreToWin: number
  scoreIncreasePerSecond: number
  eyesClosedDecayDelayMs: number
  scoreDecreasePerSecond: number
  characterOpenDurationMs: { min: number; max: number }
  characterClosedDurationMs: { min: number; max: number }
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  countdownMs: 3000,
  lossOverlapToleranceMs: 150,
  scoreToWin: 100,
  scoreIncreasePerSecond: 20,
  eyesClosedDecayDelayMs: 3000,
  scoreDecreasePerSecond: 10,
  characterOpenDurationMs: { min: 900, max: 1800 },
  characterClosedDurationMs: { min: 1200, max: 2600 },
}
