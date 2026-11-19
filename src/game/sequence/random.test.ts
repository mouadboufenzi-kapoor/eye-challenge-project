import { describe, expect, it } from 'vitest'
import { RandomEyeSequence } from './random'

describe('RandomEyeSequence', () => {
  it('starts with closed eyes and changes after the configured duration', () => {
    const sequence = new RandomEyeSequence({
      openDurationMs: { min: 100, max: 100 },
      closedDurationMs: { min: 200, max: 200 },
    })

    expect(sequence.current).toBe('closed')
    sequence.advance(199)
    expect(sequence.current).toBe('closed')
    sequence.advance(1)
    expect(sequence.current).toBe('open')
  })

  it('handles a delta that crosses multiple eye periods', () => {
    const sequence = new RandomEyeSequence({
      openDurationMs: { min: 100, max: 100 },
      closedDurationMs: { min: 200, max: 200 },
    })

    sequence.advance(250)

    expect(sequence.current).toBe('open')
    expect(sequence.remainingMs).toBe(50)
  })
})
