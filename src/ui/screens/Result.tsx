import type { ResultKind } from '../flow'
import type { CharacterDefinition } from '../../characters/registry'
import { CharacterView } from '../CharacterView'
import { Button } from '../components/Button'
import { strings } from '../strings.fr'
import { RotateCcw, Share2, Trophy } from 'lucide-react'

interface ResultProps {
  kind: ResultKind
  score: number
  record: number
  onReplay: () => void
  onShare: () => void
  onHome: () => void
  character: CharacterDefinition
}

export function Result({ kind, score, record, onReplay, onShare, onHome, character }: ResultProps) {
  if (!character) return null
  const lost = kind === 'lost'
  return (
    <main className="poster-screen result-screen">
      <CharacterView
        character={character}
        eyes="closed"
        reaction={lost ? 'laugh' : 'win'}
        className="poster-character"
      />
      {lost ? (
        <div className="result-bubble"><span>HAHAHA !</span><strong>JE T’AI EU !</strong></div>
      ) : (
        <div className="result-bubble win-bubble"><span>BRAVO !</span><strong>TU M’AS BATTU…</strong></div>
      )}
      <section className="result-panel">
        <p className="result-kicker">{lost ? strings.heldOut : strings.won}</p>
        <p className="result-time">{Math.round(score)} S</p>
        <div className="result-scores">
          <div className="result-record">
            <Trophy size={16} strokeWidth={2.4} />
            <span>{strings.record} : {Math.round(record)} s</span>
          </div>
        </div>
        <div className="result-actions">
          <Button className="replay-button" onClick={onReplay}>
            <RotateCcw size={22} strokeWidth={2.5} />
            {strings.replay}
          </Button>
          <Button tone="cream" className="secondary-action" onClick={onShare}>
            <Share2 size={19} strokeWidth={2.4} />
            {strings.share}
          </Button>
          <Button tone="cream" className="secondary-action" onClick={onHome}>
            {strings.otherCharacter}
          </Button>
        </div>
      </section>
    </main>
  )
}
