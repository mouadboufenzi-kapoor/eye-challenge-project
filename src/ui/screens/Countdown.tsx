import type { CharacterDefinition } from '../../characters/registry'
import { CharacterView } from '../CharacterView'
import { BigNumber } from '../components/BigNumber'
import { strings } from '../strings.fr'

interface CountdownProps {
  value: number
  blocked: boolean
  character: CharacterDefinition
}

export function Countdown({ value, blocked, character }: CountdownProps) {
  if (!character) return null
  return (
    <main className="poster-screen countdown-screen">
      <CharacterView character={character} eyes="closed" className="poster-character" />
      {blocked ? (
        <div className="face-blocked">{strings.countdownFaceMissing}</div>
      ) : (
        <>
          <div className="countdown-pill">{strings.countdownPrompt}</div>
          {value === 0 ? (
            <div className="countdown-go">GO !</div>
          ) : (
            <div className="countdown-number"><BigNumber value={value} /></div>
          )}
          <div className="countdown-dots" aria-label={`Décompte ${value}`}>
            {[5, 4, 3, 2, 1].map((dot) => (
              <span key={dot} className={dot === value ? 'active' : ''} />
            ))}
          </div>
        </>
      )}
    </main>
  )
}
