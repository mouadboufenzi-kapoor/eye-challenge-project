import { DEFAULT_CHARACTER } from '../characters/registry'
import type { CharacterEyes } from '../game/sequence/random'

interface CharacterViewProps {
  eyes: CharacterEyes
  reaction?: 'normal' | 'laugh'
}

export function CharacterView({ eyes, reaction = 'normal' }: CharacterViewProps) {
  if (!DEFAULT_CHARACTER) return null
  const source = reaction === 'laugh'
    ? DEFAULT_CHARACTER.assets.laugh
    : eyes === 'open'
      ? DEFAULT_CHARACTER.assets.eyesOpen
      : DEFAULT_CHARACTER.assets.eyesClosed

  return (
    <figure className="character-figure">
      <img
        src={source}
        alt={DEFAULT_CHARACTER.name}
        style={{
          objectFit: DEFAULT_CHARACTER.portrait.fit,
          objectPosition: DEFAULT_CHARACTER.portrait.position,
        }}
      />
      <figcaption>{DEFAULT_CHARACTER.name}</figcaption>
    </figure>
  )
}
