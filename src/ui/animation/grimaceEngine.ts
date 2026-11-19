import type { GrimaceCurve, GrimacePreset } from './presets'

export function pickGrimace(
  enabledIds: Array<GrimacePreset['id']>,
  random: () => number = Math.random,
): GrimacePreset['id'] {
  if (enabledIds.length === 0) return 'scare'
  const index = Math.min(
    enabledIds.length - 1,
    Math.floor(random() * enabledIds.length),
  )
  return enabledIds[index]
}

export function applyGrimace(
  root: HTMLElement,
  preset: GrimacePreset,
  reducedMotion: boolean,
): void {
  const duration = reducedMotion ? 120 : preset.durationMs
  const zoomPeak = reducedMotion ? 1.015 : preset.zoomPeak
  const shake = reducedMotion ? 1 : preset.shakeAmplitude
  const eyeScale = reducedMotion ? 1.04 : preset.eyeScaleY
  const browLift = reducedMotion ? 3 : preset.browLift
  const veinOpacity = reducedMotion ? preset.veinOpacity * 0.35 : preset.veinOpacity
  const timing = curveTiming(preset.curve)

  const portrait = root.querySelector<HTMLElement>('.portrait-base')
  if (portrait) {
    portrait.animate(
      [
        { transform: 'scale(1) translateX(0)' },
        { transform: `scale(${zoomPeak}) translateX(${shake}px)`, offset: 0.28 },
        { transform: `scale(${preset.zoomEnd}) translateX(${-shake * 0.45}px)`, offset: 0.72 },
        { transform: 'scale(1) translateX(0)' },
      ],
      { duration, easing: timing, iterations: 1 },
    )
  }

  root.querySelectorAll<HTMLElement>('.grimace-eye').forEach((eye) => {
    eye.animate(
      [
        { transform: 'scaleY(1)' },
        { transform: `scaleY(${eyeScale})`, offset: 0.3 },
        { transform: 'scaleY(1)' },
      ],
      { duration, easing: timing, iterations: 1 },
    )
  })

  root.querySelectorAll<HTMLElement>('.grimace-brow').forEach((brow) => {
    brow.animate(
      [
        { transform: 'translateY(0)' },
        { transform: `translateY(${-browLift}px)`, offset: 0.35 },
        { transform: 'translateY(0)' },
      ],
      { duration, easing: timing, iterations: 1 },
    )
  })

  root.querySelectorAll<HTMLElement>('.grimace-veins').forEach((veins) => {
    veins.animate(
      [
        { opacity: 0 },
        { opacity: veinOpacity, offset: 0.35 },
        { opacity: veinOpacity * 0.7, offset: 0.72 },
        { opacity: 0 },
      ],
      { duration: duration * 1.25, easing: timing, iterations: 1 },
    )
  })
}

export function startHeadRhythm(
  root: HTMLElement,
  intensity: number,
): () => void {
  const portrait = root.querySelector<HTMLElement>('.portrait-base')
  if (!portrait) return () => undefined

  let frame = 0
  let startedAt = performance.now()
  const amplitude = 0.006 + Math.min(1, intensity) * 0.012
  const tick = (now: number) => {
    const elapsed = (now - startedAt) / 1000
    const scale = 1 + Math.sin(elapsed * 2.2) * amplitude
    const rotation = Math.sin(elapsed * 1.4) * amplitude * 18
    portrait.style.setProperty('--rhythm-scale', scale.toFixed(4))
    portrait.style.setProperty('--rhythm-rotation', `${rotation.toFixed(3)}deg`)
    frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(frame)
}

function curveTiming(curve: GrimaceCurve): string {
  if (curve === 'ease-out') return 'ease-out'
  if (curve === 'ease-in-out') return 'ease-in-out'
  return 'linear'
}
