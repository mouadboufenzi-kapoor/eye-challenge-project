import type { GameState } from '../game/engine'
import { CharacterView } from './CharacterView'
import { ScoreProgress } from './ScoreProgress'

interface GameStatusPanelProps {
  state: GameState
  bestScore: number
  onReset: () => void
}

export function GameStatusPanel({ state, bestScore, onReset }: GameStatusPanelProps) {
  if (state.phase === 'idle' || state.phase === 'calibration') return null

  return (
    <div className="panel game-panel">
      <span className="step">Test du moteur de jeu</span>
      {state.phase === 'countdown' && (
        <h2>Départ dans {Math.ceil(state.countdownRemainingMs / 1000)}</h2>
      )}
      {state.phase === 'playing' && (
        <>
          <ScoreProgress score={state.score} />
          <CharacterView eyes={state.characterEyes} />
          <h2>
            {state.characterEyes === 'open'
              ? 'Le personnage regarde'
              : 'Le personnage ferme les yeux'}
          </h2>
          <p className="score">Score : {Math.round(state.score)}</p>
          <p className="best-score">Meilleur score : {Math.round(bestScore)}</p>
        </>
      )}
      {(state.phase === 'lost' || state.phase === 'won') && (
        <>
          {state.phase === 'lost' && <CharacterView eyes="closed" reaction="laugh" />}
          <h2>{state.phase === 'won' ? 'Gagné' : 'Perdu'}</h2>
          <p className="score">Score : {Math.round(state.score)}</p>
          <p className="best-score">Meilleur score : {Math.round(bestScore)}</p>
          <button onClick={onReset}>Recommencer</button>
        </>
      )}
    </div>
  )
}
