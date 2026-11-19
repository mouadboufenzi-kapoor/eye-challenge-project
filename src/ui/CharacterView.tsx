import { DEFAULT_CHARACTER } from '../characters/registry'
import type { CharacterEyes } from '../game/sequence/random'
import type { CharacterDefinition } from '../characters/registry'

interface CharacterViewProps {
  eyes: CharacterEyes
  reaction?: 'normal' | 'laugh'
  character?: CharacterDefinition
  className?: string
}

export function CharacterView({
  eyes,
  reaction = 'normal',
  character = DEFAULT_CHARACTER,
  className = '',
}: CharacterViewProps) {
  if (!character) return null
  const source = reaction === 'laugh'
    ? character.assets.laugh
    : eyes === 'open'
      ? character.assets.eyesOpen
      : character.assets.eyesClosed

  return (
    <figure className={`character-figure ${className}`.trim()}>
      <img
        src={source}
        alt={character.name}
        style={{
          objectFit: character.portrait.fit,
          objectPosition: character.portrait.position,
        }}
      />
      <figcaption>{DEFAULT_CHARACTER.name}</figcaption>
    </figure>
  )
}
