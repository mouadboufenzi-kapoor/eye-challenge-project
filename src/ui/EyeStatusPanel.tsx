import type { EyeState } from '../input/eyeTracker'

interface EyeStatusPanelProps {
  state: EyeState
  onStartGame: () => void
}

export function EyeStatusPanel({ state, onStartGame }: EyeStatusPanelProps) {
  const eyesClosed = state.leftClosed && state.rightClosed

  return (
    <div className="panel result">
      <div className={`eye-state ${eyesClosed ? 'closed' : 'open'}`}>
        {eyesClosed ? 'FERMÉS' : 'OUVERTS'}
      </div>
      <p className="face">
        <span className={state.faceDetected ? 'dot detected' : 'dot'} />
        {state.faceDetected ? 'Visage détecté' : 'Visage non détecté'}
      </p>
      {!state.faceDetected && (
        <p className="hint">Place ton visage face à la caméra et améliore la lumière.</p>
      )}
      <button onClick={onStartGame}>Lancer le test de jeu</button>
    </div>
  )
}
