import { FIRST_CHARACTER } from '../characters/catalog'
import type { CharacterEyes } from '../game/sequence/random'

interface CharacterViewProps {
  eyes: CharacterEyes
  reaction?: 'normal' | 'laugh'
}

export function CharacterView({ eyes, reaction = 'normal' }: CharacterViewProps) {
  const source = reaction === 'laugh'
    ? FIRST_CHARACTER.assets.laugh
    : eyes === 'open'
      ? FIRST_CHARACTER.assets.eyesOpen
      : FIRST_CHARACTER.assets.eyesClosed

  return (
    <figure className="character-figure">
      <img src={source} alt={FIRST_CHARACTER.name} />
      <figcaption>{FIRST_CHARACTER.name}</figcaption>
    </figure>
  )
}
