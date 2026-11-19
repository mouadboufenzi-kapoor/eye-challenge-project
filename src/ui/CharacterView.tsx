import { useLayoutEffect, useRef } from 'react'
import { DEFAULT_CHARACTER } from '../characters/registry'
import type { CharacterEyes } from '../game/sequence/random'
import type { CharacterDefinition } from '../characters/registry'
import { grimacePresets } from './animation/presets'
import { applyGrimace, pickGrimace, startHeadRhythm } from './animation/grimaceEngine'

interface CharacterViewProps {
  eyes: CharacterEyes
  reaction?: 'normal' | 'laugh'
  character?: CharacterDefinition
  className?: string
  audioIntensity?: number
}

export function CharacterView({
  eyes,
  reaction = 'normal',
  character = DEFAULT_CHARACTER,
  className = '',
  audioIntensity = 0,
}: CharacterViewProps) {
  if (!character) return null
  const figureRef = useRef<HTMLElement>(null)
  const previousEyesRef = useRef<CharacterEyes>('closed')
  const leftEye = character.portrait.anchorLeftEye
  const rightEye = character.portrait.anchorRightEye
  const eyePosition = (anchor: [number, number]) => ({
    left: `${(anchor[0] / 600) * 100}%`,
    top: `${(anchor[1] / 900) * 100}%`,
  })

  useLayoutEffect(() => {
    const figure = figureRef.current
    if (!figure) return
    if (eyes === 'open' && previousEyesRef.current !== 'open') {
      const enabledIds = (Object.keys(grimacePresets) as Array<keyof typeof grimacePresets>)
        .filter((id) => character.grimaceOverrides[id]?.enabled !== false)
      const presetId = pickGrimace(enabledIds)
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      applyGrimace(figure, grimacePresets[presetId], reducedMotion)
    }
    previousEyesRef.current = eyes
  }, [character, eyes])

  useLayoutEffect(() => {
    const figure = figureRef.current
    if (!figure || reaction !== 'normal') return
    return startHeadRhythm(figure, audioIntensity)
  }, [audioIntensity, reaction])

  const source = reaction === 'laugh'
    ? character.assets.laugh
    : eyes === 'open'
      ? character.assets.eyesOpen
      : character.assets.eyesClosed

  return (
    <figure
      ref={figureRef}
      className={`character-figure ${eyes === 'closed' ? 'idle' : 'open'} ${className}`.trim()}
    >
      <img
        src={source}
        className="portrait-base"
        alt={character.name}
        style={{
          objectFit: character.portrait.fit,
          objectPosition: character.portrait.position,
        }}
      />
      <div className="grimace-brow brow-left" style={eyePosition([leftEye[0], leftEye[1] - 70])} />
      <div className="grimace-brow brow-right" style={eyePosition([rightEye[0], rightEye[1] - 70])} />
      <div className="grimace-eye eye-left" style={eyePosition(leftEye)} />
      <div className="grimace-eye eye-right" style={eyePosition(rightEye)} />
      <div className="grimace-veins veins-left" style={eyePosition([leftEye[0] - 18, leftEye[1]])} />
      <div className="grimace-veins veins-right" style={eyePosition([rightEye[0] - 18, rightEye[1]])} />
      <figcaption>{character.name}</figcaption>
    </figure>
  )
}
