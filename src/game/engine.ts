import { DEFAULT_GAME_CONFIG, type GameConfig } from './config'
import { RandomEyeSequence, type CharacterEyes } from './sequence/random'
import { updateScore, type ScoreState } from './scoring'

export type GamePhase =
  | 'idle'
  | 'calibration'
  | 'countdown'
  | 'playing'
  | 'lost'
  | 'won'

export interface PlayerEyeInput {
  eyesOpen: boolean
}

export interface GameState {
  phase: GamePhase
  characterEyes: CharacterEyes
  score: number
  countdownRemainingMs: number
  elapsedMs: number
  lossOverlapMs: number
}

export class GameEngine {
  private readonly config: GameConfig
  private readonly random: () => number
  private sequence: RandomEyeSequence
  private score: ScoreState = { value: 0, closedSinceMs: null }
  private phase: GamePhase = 'idle'
  private elapsedMs = 0
  private countdownRemainingMs = 0
  private lossOverlapMs = 0

  constructor(
    config: Partial<GameConfig> = {},
    random: () => number = Math.random,
  ) {
    this.config = mergeConfig(config)
    this.random = random
    this.sequence = this.createSequence(random)
  }

  getState(): GameState {
    return {
      phase: this.phase,
      characterEyes: this.sequence.current,
      score: this.score.value,
      countdownRemainingMs: this.countdownRemainingMs,
      elapsedMs: this.elapsedMs,
      lossOverlapMs: this.lossOverlapMs,
    }
  }

  beginCalibration(): void {
    this.phase = 'calibration'
    this.resetProgress()
  }

  finishCalibration(): void {
    if (this.phase !== 'calibration') return
    this.phase = 'countdown'
    this.countdownRemainingMs = this.config.countdownMs
  }

  tick(deltaMs: number, input: PlayerEyeInput): GameState {
    const safeDeltaMs = Math.max(0, deltaMs)
    if (this.phase === 'countdown') {
      this.countdownRemainingMs = Math.max(0, this.countdownRemainingMs - safeDeltaMs)
      if (this.countdownRemainingMs > 0) return this.getState()
      this.phase = 'playing'
    }

    if (this.phase !== 'playing') return this.getState()

    this.elapsedMs += safeDeltaMs
    this.sequence.advance(safeDeltaMs)
    if (this.updateLossOverlap(safeDeltaMs, input.eyesOpen)) return this.getState()

    this.score = updateScore(
      this.score,
      input.eyesOpen,
      this.sequence.current,
      safeDeltaMs,
      this.elapsedMs,
      this.config,
    )
    if (this.score.value >= this.config.scoreToWin) this.phase = 'won'
    return this.getState()
  }

  reset(): void {
    this.phase = 'idle'
    this.resetProgress()
  }

  private updateLossOverlap(deltaMs: number, playerEyesOpen: boolean): boolean {
    const overlapping = playerEyesOpen && this.sequence.current === 'open'
    this.lossOverlapMs = overlapping ? this.lossOverlapMs + deltaMs : 0
    if (this.lossOverlapMs > this.config.lossOverlapToleranceMs) {
      this.phase = 'lost'
      return true
    }
    return false
  }

  private resetProgress(): void {
    this.score = { value: 0, closedSinceMs: null }
    this.elapsedMs = 0
    this.countdownRemainingMs = 0
    this.lossOverlapMs = 0
    this.sequence = this.createSequence(this.random)
  }

  private createSequence(random?: () => number): RandomEyeSequence {
    return new RandomEyeSequence({
      openDurationMs: this.config.characterOpenDurationMs,
      closedDurationMs: this.config.characterClosedDurationMs,
      random,
    })
  }
}

function mergeConfig(overrides: Partial<GameConfig>): GameConfig {
  return {
    ...DEFAULT_GAME_CONFIG,
    ...overrides,
    characterOpenDurationMs: {
      ...DEFAULT_GAME_CONFIG.characterOpenDurationMs,
      ...overrides.characterOpenDurationMs,
    },
    characterClosedDurationMs: {
      ...DEFAULT_GAME_CONFIG.characterClosedDurationMs,
      ...overrides.characterClosedDurationMs,
    },
  }
}
