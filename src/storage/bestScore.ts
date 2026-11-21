export const BEST_SCORE_STORAGE_KEY = 'eye-challenge.best-score'

export function readBestScore(storage: Storage = window.localStorage): number {
  try {
    const storedValue = storage.getItem(BEST_SCORE_STORAGE_KEY)
    const parsedValue = storedValue === null ? 0 : Number(storedValue)
    return Number.isFinite(parsedValue) && parsedValue >= 0
      ? Math.round(parsedValue)
      : 0
  } catch (error) {
    console.warn('Impossible de lire le meilleur score local', error)
    return 0
  }
}

export function saveBestScore(score: number, storage: Storage = window.localStorage): number {
  const bestScore = Math.max(0, Math.round(score))
  try {
    storage.setItem(BEST_SCORE_STORAGE_KEY, String(bestScore))
  } catch (error) {
    console.warn('Impossible de sauvegarder le meilleur score local', error)
  }
  return bestScore
}
