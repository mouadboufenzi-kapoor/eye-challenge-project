interface StartScreenProps {
  onStart: () => void
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="panel start-panel">
      <p className="start-description">
        Garde les yeux ouverts quand le personnage ferme les siens.
        Ferme-les quand il te regarde.
      </p>
      <button onClick={onStart}>Commencer</button>
    </div>
  )
}
