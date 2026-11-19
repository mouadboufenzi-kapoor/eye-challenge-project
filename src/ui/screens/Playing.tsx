import type { EyeState } from '../../input/eyeTracker'
import { Trophy } from 'lucide-react'
import type { GameState } from '../../game/engine'
import type { CharacterDefinition } from '../../characters/registry'
import { CharacterView } from '../CharacterView'
import { ProgressBar } from '../components/ProgressBar'
import { Pill } from '../components/Pill'
import { DEFAULT_GAME_CONFIG } from '../../game/config'
import { strings } from '../strings.fr'

interface PlayingProps {
  eyeState: EyeState
  gameState: GameState
  record: number
  character: CharacterDefinition
}

export function Playing({ eyeState, gameState, record, character }: PlayingProps) {
  if (!character) return null
  const eyesClosed = eyeState.leftClosed && eyeState.rightClosed

  return (
    <main className="poster-screen playing-screen">
      <div className="game-topbar">
        <span className="game-time">
          {Math.floor(gameState.elapsedMs / 1000)}{strings.secondsSuffix}
        </span>
        <div className="game-record">
          <Trophy size={16} strokeWidth={2.4} />
          <span>{record > 0 ? `${strings.record} : ${Math.round(record)} s` : strings.noRecord}</span>
        </div>
        <ProgressBar
          value={gameState.score}
          maximum={DEFAULT_GAME_CONFIG.scoreToWin}
        />
      </div>
      <CharacterView
        character={character}
        eyes={gameState.characterEyes}
        className="poster-character"
        audioIntensity={gameState.score / DEFAULT_GAME_CONFIG.scoreToWin}
      />
      <Pill tone="cream" className="eye-status-pill">
        <span className={eyesClosed ? 'eye-status-dot closed' : 'eye-status-dot open'} />
        <span>{eyesClosed ? strings.eyesClosed : strings.eyesOpen}</span>
      </Pill>
    </main>
  )
}
