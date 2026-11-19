import { characters, DEFAULT_CHARACTER } from '../../characters/registry'
import { CharacterView } from '../CharacterView'
import { Button } from '../components/Button'
import { Popup } from '../components/Popup'
import { strings } from '../strings.fr'
import { CameraOff } from 'lucide-react'
import { EyeIcon } from '../components/EyeIcon'

interface RulesProps {
  characterIndex: number
  error: string | null
  loading: boolean
  onStart: () => void
  onRetry: () => void
}

export function Rules({ characterIndex, error, loading, onStart, onRetry }: RulesProps) {
  const character = characters[characterIndex] ?? DEFAULT_CHARACTER
  if (!character) return null
  return (
    <main className="poster-screen rules-screen">
      <CharacterView character={character} eyes="closed" className="poster-character" />
      <Popup>
        {error ? (
          <>
            <CameraOff className="camera-off-icon" size={42} strokeWidth={2.4} />
            <h2 className="camera-error-title">{strings.cameraRefusedTitle}</h2>
            <p>{strings.cameraRefusedText}</p>
            <Button onClick={onRetry}>{strings.retry}</Button>
          </>
        ) : (
          <>
            <div className="gold-rule-pill">RÈGLE D’OR</div>
            <h2 className="ui-popup-title rules-popup-title">
              <span>NE CROISE PAS</span>
              <span>SON REGARD !</span>
            </h2>
            <div className="rules-versus">
              <div><EyeIcon /><strong>LUI</strong></div>
              <strong>+</strong>
              <div><EyeIcon /><strong>TOI</strong></div>
              <strong>=</strong>
              <span className="rules-lost">{strings.rulesResult}</span>
            </div>
            <p>{strings.rulesLine}</p>
            <Button onClick={onStart} disabled={loading}>
              {loading ? 'CHARGEMENT…' : strings.rulesStart}
            </Button>
          </>
        )}
      </Popup>
    </main>
  )
}
