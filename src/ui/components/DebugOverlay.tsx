import { useEffect, useMemo, useState } from 'react'
import type { CharacterDefinition } from '../../characters/registry'
import type { CharacterEyes } from '../../game/sequence/random'

interface DebugOverlayProps {
  character: CharacterDefinition
}

export function DebugOverlay({ character }: DebugOverlayProps) {
  const [positionX, setPositionX] = useState(character.portrait.positionX ?? 50)
  const [positionY, setPositionY] = useState(character.portrait.positionY ?? 24)
  const [zoom, setZoom] = useState(character.portrait.zoom ?? 1)
  const [dx, setDx] = useState(0)
  const [dy, setDy] = useState(0)
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('eye-challenge-debug-settings', {
      detail: { positionX, positionY, zoom, dx, dy, scale, rotate },
    }))
  }, [dx, dy, positionX, positionY, rotate, scale, zoom])

  const metaDraft = useMemo(() => ({
    id: character.id,
    name: character.name,
    category: character.category,
    reaction: character.reaction,
    colors: character.colors,
    portrait: {
      ...character.portrait,
      positionX,
      positionY,
      zoom,
    },
    align: {
      ...(character.align ?? {}),
      'eyes-open': { dx, dy, scale, rotate },
    },
    eyeRegion: character.eyeRegion,
    eyeAnchors: character.eyeAnchors,
    mouth: character.mouth,
    transition: character.transition,
    difficulty: character.difficulty,
    grimaceOverrides: character.grimaceOverrides,
  }), [character, dx, dy, positionX, positionY, rotate, scale, zoom])

  const preview = (eyes: CharacterEyes, reaction: 'normal' | 'laugh' | 'win' = 'normal') => {
    window.dispatchEvent(new CustomEvent('eye-challenge-preview', {
      detail: { eyes, reaction },
    }))
  }

  const copyMeta = async () => {
    await navigator.clipboard?.writeText(JSON.stringify(metaDraft, null, 2))
  }

  return (
    <aside className="debug-overlay" aria-label="Réglages personnage">
      <strong>{character.name}</strong>
      <label>Position X <input type="range" min="0" max="100" value={positionX} onChange={(event) => setPositionX(Number(event.target.value))} /></label>
      <label>Position Y <input type="range" min="0" max="100" value={positionY} onChange={(event) => setPositionY(Number(event.target.value))} /></label>
      <label>Zoom <input type="range" min="0.8" max="1.8" step="0.01" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /></label>
      <label>DX <input type="range" min="-100" max="100" value={dx} onChange={(event) => setDx(Number(event.target.value))} /></label>
      <label>DY <input type="range" min="-100" max="100" value={dy} onChange={(event) => setDy(Number(event.target.value))} /></label>
      <label>Scale <input type="range" min="0.8" max="1.2" step="0.01" value={scale} onChange={(event) => setScale(Number(event.target.value))} /></label>
      <label>Rotate <input type="range" min="-30" max="30" value={rotate} onChange={(event) => setRotate(Number(event.target.value))} /></label>
      <div className="debug-preview-actions">
        <button onClick={() => preview('open')}>Ouvrir</button>
        <button onClick={() => preview('closed')}>Fermer</button>
        <button onClick={() => preview('closed', 'laugh')}>Laugh</button>
        <button onClick={() => preview('closed', 'win')}>Win</button>
      </div>
      <div className="debug-meta">
        <span>Œil G {character.eyeAnchors?.left.x.toFixed(3)}, {character.eyeAnchors?.left.y.toFixed(3)}</span>
        <span>Œil D {character.eyeAnchors?.right.x.toFixed(3)}, {character.eyeAnchors?.right.y.toFixed(3)}</span>
        <span>Bouche {character.mouth?.x.toFixed(3)}, {character.mouth?.y.toFixed(3)}</span>
      </div>
      <button className="debug-copy" onClick={() => void copyMeta()}>Copier meta.json</button>
    </aside>
  )
}
