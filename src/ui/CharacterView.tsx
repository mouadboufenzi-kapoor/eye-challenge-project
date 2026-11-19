import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { CharacterDefinition } from '../characters/registry'
import type { CharacterEyes } from '../game/sequence/random'

interface CharacterViewProps {
  eyes: CharacterEyes
  reaction?: 'normal' | 'laugh' | 'win'
  character: CharacterDefinition
  className?: string
  audioIntensity?: number
}

export function CharacterView({
  eyes,
  reaction = 'normal',
  character,
  className = '',
  audioIntensity = 0,
}: CharacterViewProps) {
  const rootRef = useRef<HTMLElement>(null)
  const previousEyesRef = useRef<CharacterEyes>('closed')
  const portrait = character.portrait
  const [preview, setPreview] = useState<{ eyes: CharacterEyes; reaction: 'normal' | 'laugh' | 'win' } | null>(null)
  const [debugSettings, setDebugSettings] = useState({
    positionX: portrait.positionX ?? 50,
    positionY: portrait.positionY ?? 24,
    zoom: portrait.zoom ?? 1,
    dx: 0,
    dy: 0,
    scale: 1,
    rotate: 0,
  })
  const positionX = debugSettings.positionX
  const positionY = debugSettings.positionY
  const zoom = debugSettings.zoom
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ eyes: CharacterEyes; reaction: 'normal' | 'laugh' | 'win' }>).detail
      setPreview(detail)
    }
    window.addEventListener('eye-challenge-preview', handler)
    return () => window.removeEventListener('eye-challenge-preview', handler)
  }, [])
  useEffect(() => {
    const handler = (event: Event) => {
      setDebugSettings((event as CustomEvent<typeof debugSettings>).detail)
    }
    window.addEventListener('eye-challenge-debug-settings', handler)
    return () => window.removeEventListener('eye-challenge-debug-settings', handler)
  }, [])
  const effectiveEyes = preview?.eyes ?? eyes
  const effectiveReaction = preview?.reaction ?? reaction

  useLayoutEffect(() => {
    const sources = [
      character.assets.eyesClosed,
      character.assets.eyesOpen,
      character.assets.eyesHalf,
      character.assets.laugh,
      character.assets.win,
    ].filter(Boolean)
    sources.forEach((source) => {
      const image = new Image()
      image.src = source
      void image.decode?.().catch(() => undefined)
    })
  }, [character])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const open = root.querySelector<HTMLImageElement>('.character-layer-open')
    const half = root.querySelector<HTMLImageElement>('.character-layer-half')
    const laugh = root.querySelector<HTMLImageElement>('.character-layer-laugh')
    const win = root.querySelector<HTMLImageElement>('.character-layer-win')
    const closing = previousEyesRef.current === 'open' && effectiveEyes === 'closed'
    const opening = previousEyesRef.current === 'closed' && effectiveEyes === 'open'
    const previousReaction = effectiveReaction

    laugh?.animate([{ opacity: effectiveReaction === 'laugh' ? 1 : 0 }], {
      duration: effectiveReaction === 'laugh' ? 90 : 70,
      fill: 'forwards',
    })
    win?.animate([{ opacity: effectiveReaction === 'win' ? 1 : 0 }], {
      duration: effectiveReaction === 'win' ? 90 : 70,
      fill: 'forwards',
    })

    if (opening) {
      if (half && character.assets.eyesHalf) {
        half.animate(
          [{ opacity: 0 }, { opacity: 1, offset: 0.44 }, { opacity: 0, offset: 1 }],
          { duration: 90, easing: 'ease-out', fill: 'forwards' },
        )
      }
      open?.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: character.transition?.durationOpenMs ?? 90,
        easing: character.transition?.easing ?? 'ease-out',
        fill: 'forwards',
      })
    } else if (closing) {
      open?.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: character.transition?.durationCloseMs ?? 70,
        easing: character.transition?.easing ?? 'ease-out',
        fill: 'forwards',
      })
      if (half && character.assets.eyesHalf) {
        half.animate(
          [{ opacity: 0 }, { opacity: 1, offset: 0.44 }, { opacity: 0, offset: 1 }],
          { duration: 70, easing: 'ease-out', fill: 'forwards' },
        )
      }
    } else if (effectiveEyes === 'closed') {
      open?.animate([{ opacity: 0 }], { duration: 1, fill: 'forwards' })
      half?.animate([{ opacity: 0 }], { duration: 1, fill: 'forwards' })
    } else {
      open?.animate([{ opacity: 1 }], { duration: 1, fill: 'forwards' })
      half?.animate([{ opacity: 0 }], { duration: 1, fill: 'forwards' })
    }

    void previousReaction
    previousEyesRef.current = effectiveEyes
  }, [character, effectiveEyes, effectiveReaction])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    const start = performance.now()

    const animate = (now: number) => {
      const elapsed = (now - start) / 1000
      const breath = reduced ? 1 : 1 + Math.sin(elapsed * (Math.PI * 2 / 3.5)) * 0.006
      const sway = reduced ? 0 : Math.sin(elapsed * 0.75) * 0.4
      const pulse = reduced ? 1 : 1 + audioIntensity * Math.sin(elapsed * 2.2) * 0.012
      root.style.setProperty('--character-breath', `${breath * pulse}`)
      root.style.setProperty('--character-sway', `${sway}deg`)
      frame = requestAnimationFrame(animate)
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [audioIntensity])

  const alignStyle = (filename: string) => {
    const alignKey = Object.keys(character.align ?? {}).find((key) =>
      key.startsWith(`${filename}.`),
    )
    const align = alignKey ? character.align?.[alignKey] : undefined
    const dx = (align?.dx ?? 0) + debugSettings.dx
    const dy = (align?.dy ?? 0) + debugSettings.dy
    const scale = (align?.scale ?? 1) * debugSettings.scale
    const rotate = (align?.rotate ?? 0) + debugSettings.rotate
    return {
      transform: `translate(${dx}px, ${dy}px) scale(${scale}) rotate(${rotate}deg)`,
      objectPosition: `${positionX}% ${positionY}%`,
    } as const
  }

  const eyeRegion = character.eyeRegion
  const maskStyle = eyeRegion
    ? ({
        '--eye-region-x': `${eyeRegion.x * 100}%`,
        '--eye-region-y': `${eyeRegion.y * 100}%`,
        '--eye-region-w': `${eyeRegion.w * 100}%`,
        '--eye-region-h': `${eyeRegion.h * 100}%`,
        '--eye-feather': `${eyeRegion.feather * 100}%`,
      } as CSSProperties)
    : undefined

  return (
    <figure
      ref={rootRef}
      className={`character-figure ${effectiveEyes === 'closed' ? 'idle' : 'open'} ${className}`.trim()}
      style={{
        '--character-position-x': `${positionX}%`,
        '--character-position-y': `${positionY}%`,
        '--character-zoom': zoom,
        ...maskStyle,
      } as CSSProperties}
    >
      {character.assets.eyesClosed && (
        <img
          className="character-layer character-layer-closed"
          src={character.assets.eyesClosed}
          alt=""
          draggable={false}
          style={alignStyle('eyes-closed')}
        />
      )}
      {character.assets.eyesOpen && (
        <img
          className={`character-layer character-layer-open ${character.transition?.mode === 'full' ? 'character-layer-full' : ''}`}
          src={character.assets.eyesOpen}
          alt=""
          draggable={false}
          style={alignStyle('eyes-open')}
        />
      )}
      {character.assets.eyesHalf && (
        <img
          className="character-layer character-layer-half"
          src={character.assets.eyesHalf}
          alt=""
          draggable={false}
          style={alignStyle('eyes-half')}
        />
      )}
      {character.assets.laugh && (
        <img
          className="character-layer character-layer-laugh"
          src={character.assets.laugh}
          alt=""
          draggable={false}
          style={alignStyle('laugh')}
        />
      )}
      {character.assets.win && (
        <img
          className="character-layer character-layer-win"
          src={character.assets.win}
          alt=""
          draggable={false}
          style={alignStyle('win')}
        />
      )}
    </figure>
  )
}
