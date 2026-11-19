interface ProgressBarProps {
  value: number
  maximum: number
  label?: string
}

export function ProgressBar({ value, maximum, label }: ProgressBarProps) {
  const safeMaximum = Math.max(1, maximum)
  const percentage = Math.min(100, Math.max(0, (value / safeMaximum) * 100))

  return (
    <div
      className="ui-progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMaximum}
      aria-valuenow={Math.round(value)}
    >
      <div className="ui-progress-value" style={{ width: `${percentage}%` }} />
    </div>
  )
}
