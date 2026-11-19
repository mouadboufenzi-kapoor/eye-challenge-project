import { DEFAULT_GAME_CONFIG } from '../game/config'

interface ScoreProgressProps {
  score: number
}

export function ScoreProgress({ score }: ScoreProgressProps) {
  const maximum = DEFAULT_GAME_CONFIG.scoreToWin
  const value = Math.min(maximum, Math.max(0, score))
  const percentage = (value / maximum) * 100

  return (
    <div className="score-progress">
      <div className="score-progress-label">
        <span>Progression</span>
        <span>{Math.round(value)} / {maximum}</span>
      </div>
      <div
        className="score-progress-track"
        role="progressbar"
        aria-label="Progression du score"
        aria-valuemin={0}
        aria-valuemax={maximum}
        aria-valuenow={Math.round(value)}
      >
        <div className="score-progress-value" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
