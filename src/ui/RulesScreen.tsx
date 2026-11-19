interface RulesScreenProps {
  onContinue: () => void
  onBack: () => void
}

export function RulesScreen({ onContinue, onBack }: RulesScreenProps) {
  return (
    <div className="panel rules-panel">
      <h2>Règles</h2>
      <ol>
        <li>Le personnage ouvre et ferme les yeux au hasard.</li>
        <li>Tu marques des points quand tes yeux sont ouverts et les siens fermés.</li>
        <li>Tu perds si vous avez les yeux ouverts en même temps.</li>
      </ol>
      <div className="screen-actions">
        <button className="secondary-button" onClick={onBack}>Retour</button>
        <button onClick={onContinue}>Continuer</button>
      </div>
    </div>
  )
}
