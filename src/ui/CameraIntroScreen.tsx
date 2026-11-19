interface CameraIntroScreenProps {
  onAllow: () => void
  onBack: () => void
}

export function CameraIntroScreen({ onAllow, onBack }: CameraIntroScreenProps) {
  return (
    <div className="panel camera-intro-panel">
      <h2>Prépare la caméra</h2>
      <p>
        La caméra frontale sert uniquement à détecter tes yeux.
        La vidéo reste sur ton téléphone, rien n'est envoyé ni stocké.
      </p>
      <p className="camera-note">
        Place-toi face à une lumière correcte et garde ton visage dans l'axe.
      </p>
      <div className="screen-actions">
        <button className="secondary-button" onClick={onBack}>Retour</button>
        <button onClick={onAllow}>Activer la caméra</button>
      </div>
    </div>
  )
}
