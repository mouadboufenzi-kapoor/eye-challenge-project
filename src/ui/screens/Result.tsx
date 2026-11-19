import type { ResultKind } from '../flow'
import { DEFAULT_CHARACTER } from '../../characters/registry'
import { CharacterView } from '../CharacterView'
import { Button } from '../components/Button'
import { strings } from '../strings.fr'

interface ResultProps {
  kind: ResultKind
  score: number
  record: number
  onReplay: () => void
  onShare: () => void
  onHome: () => void
}

export function Result({ kind, score, record, onReplay, onShare, onHome }: ResultProps) {
  const character = DEFAULT_CHARACTER
  if (!character) return null
  const lost = kind === 'lost'
  return (
    <main className="poster-screen result-screen">
      <CharacterView
        character={character}
        eyes="closed"
        reaction={lost ? 'laugh' : 'normal'}
        className="poster-character"
      />
      {lost && <div className="result-bubble">{strings.loseReaction}</div>}
      <section className="result-panel">
        <h1>{lost ? strings.lost : strings.won}</h1>
        <div className="result-scores">
          <div><span>{strings.score}</span><strong>{Math.round(score)}</strong></div>
          <div><span>{strings.record}</span><strong>{Math.round(record)}</strong></div>
        </div>
        <div className="result-actions">
          <Button onClick={onReplay}>{strings.replay}</Button>
          <Button tone="cream" onClick={onShare}>{strings.share}</Button>
          <Button tone="ink" onClick={onHome}>{strings.otherCharacter}</Button>
        </div>
      </section>
    </main>
  )
}
