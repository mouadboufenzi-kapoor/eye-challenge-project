import { DEFAULT_CHARACTER } from '../../characters/registry'
import { CharacterView } from '../CharacterView'
import { BigNumber } from '../components/BigNumber'

interface CountdownProps {
  value: number
  blocked: boolean
}

export function Countdown({ value, blocked }: CountdownProps) {
  const character = DEFAULT_CHARACTER
  if (!character) return null
  return (
    <main className="poster-screen countdown-screen">
      <CharacterView character={character} eyes="closed" className="poster-character" />
      {blocked ? (
        <div className="face-blocked">PLACE TON VISAGE DEVANT LA CAMÉRA</div>
      ) : (
        <div className="countdown-number"><BigNumber value={value} /></div>
      )}
    </main>
  )
}
