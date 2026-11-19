import type { EyeState } from '../../input/eyeTracker'
import type { GameState } from '../../game/engine'
import { DEFAULT_CHARACTER } from '../../characters/registry'
import { CharacterView } from '../CharacterView'
import { ProgressBar } from '../components/ProgressBar'
import { Pill } from '../components/Pill'
import { DEFAULT_GAME_CONFIG } from '../../game/config'
import { strings } from '../strings.fr'

interface PlayingProps {
  eyeState: EyeState
  gameState: GameState
}

export function Playing({ eyeState, gameState }: PlayingProps) {
  const character = DEFAULT_CHARACTER
  if (!character) return null
  const eyesClosed = eyeState.leftClosed && eyeState.rightClosed

  return (
    <main className="poster-screen playing-screen">
      <div className="game-topbar">
        <ProgressBar
          value={gameState.score}
          maximum={DEFAULT_GAME_CONFIG.scoreToWin}
        />
        <span className="game-time">
          {Math.floor(gameState.elapsedMs / 1000)}s
        </span>
      </div>
      <CharacterView
        character={character}
        eyes={gameState.characterEyes}
        className="poster-character"
      />
      <Pill tone={eyesClosed ? 'green' : 'yellow'}>
        {eyesClosed ? strings.eyesClosed : strings.eyesOpen}
      </Pill>
    </main>
  )
}
