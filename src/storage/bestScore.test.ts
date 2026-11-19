import { describe, expect, it } from 'vitest'
import { readBestScore, saveBestScore } from './bestScore'

function createStorage(): Storage {
  const values = new Map<string, string>()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    clear: () => values.clear(),
    key: (index) => [...values.keys()][index] ?? null,
    get length() { return values.size },
  }
}

describe('best score storage', () => {
  it('returns zero when no score exists', () => {
    expect(readBestScore(createStorage())).toBe(0)
  })

  it('saves and reads the best score', () => {
    const storage = createStorage()

    saveBestScore(42.5, storage)

    expect(readBestScore(storage)).toBe(42.5)
  })

  it('ignores invalid stored values', () => {
    const storage = createStorage()
    storage.setItem('eye-challenge.best-score', 'not-a-number')

    expect(readBestScore(storage)).toBe(0)
  })
})
