import { characters, DEFAULT_CHARACTER } from '../../characters/registry'
import { CharacterView } from '../CharacterView'
import { Button } from '../components/Button'
import { Popup } from '../components/Popup'
import { strings } from '../strings.fr'

interface RulesProps {
  characterIndex: number
  error: string | null
  loading: boolean
  onStart: () => void
  onRetry: () => void
}

export function Rules({ characterIndex, error, loading, onStart, onRetry }: RulesProps) {
  const character = characters[characterIndex] ?? DEFAULT_CHARACTER
  if (!character) return null
  return (
    <main className="poster-screen rules-screen">
      <CharacterView character={character} eyes="closed" className="poster-character" />
      <Popup title={strings.rulesTitle}>
        {error ? (
          <>
            <p>{error}</p>
            <Button onClick={onRetry}>{strings.retry}</Button>
          </>
        ) : (
          <>
            <div className="rules-versus">
              <span>LUI</span>
              <strong>+</strong>
              <span>TOI</span>
              <strong>=</strong>
              <span className="rules-lost">{strings.rulesResult}</span>
            </div>
            <p>{strings.rulesLine}</p>
            <Button onClick={onStart} disabled={loading}>
              {loading ? 'CHARGEMENT…' : strings.rulesStart}
            </Button>
          </>
        )}
      </Popup>
    </main>
  )
}
