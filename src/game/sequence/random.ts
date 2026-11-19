export type CharacterEyes = 'open' | 'closed'

export interface DurationRange {
  min: number
  max: number
}

export interface RandomSequenceConfig {
  openDurationMs: DurationRange
  closedDurationMs: DurationRange
  random?: () => number
}

export interface EyeSequence {
  current: CharacterEyes
  remainingMs: number
  advance(deltaMs: number): void
}

export class RandomEyeSequence implements EyeSequence {
  current: CharacterEyes = 'closed'
  remainingMs: number

  private readonly config: RandomSequenceConfig
  private readonly random: () => number

  constructor(config: RandomSequenceConfig) {
    this.config = config
    this.random = config.random ?? Math.random
    this.remainingMs = this.durationFor('closed')
  }

  advance(deltaMs: number): void {
    let remaining = Math.max(0, deltaMs)

    while (remaining >= this.remainingMs) {
      remaining -= this.remainingMs
      this.current = this.current === 'open' ? 'closed' : 'open'
      this.remainingMs = this.durationFor(this.current)
    }

    this.remainingMs -= remaining
  }

  private durationFor(state: CharacterEyes): number {
    const range = state === 'open'
      ? this.config.openDurationMs
      : this.config.closedDurationMs
    return randomDuration(range, this.random)
  }
}

function randomDuration(range: DurationRange, random: () => number): number {
  const min = Math.max(1, Math.min(range.min, range.max))
  const max = Math.max(min, Math.max(range.min, range.max))
  return Math.round(min + random() * (max - min))
}
