interface CalibrationPanelProps {
  step: 'close' | 'open'
  remaining: number
}

export function CalibrationPanel({ step, remaining }: CalibrationPanelProps) {
  return (
    <div className="panel calibration">
      <span className="step">Calibration {step === 'close' ? '1' : '2'} / 2</span>
      <h2>{step === 'close' ? 'Ferme les yeux' : 'Ouvre les yeux'}</h2>
      <strong>{remaining}</strong>
      <p>Garde cette position pendant 2 secondes.</p>
    </div>
  )
}
