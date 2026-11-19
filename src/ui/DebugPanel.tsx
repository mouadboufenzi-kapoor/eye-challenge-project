import type { EyeState } from '../input/eyeTracker'

export function DebugPanel({ state, visible }: { state: EyeState; visible: boolean }) {
  if (!visible) return null

  return (
    <details className="debug" open>
      <summary>Debug MediaPipe</summary>
      <dl>
        <div><dt>eyeBlinkLeft</dt><dd>{state.leftBlink.toFixed(3)}</dd></div>
        <div><dt>eyeBlinkRight</dt><dd>{state.rightBlink.toFixed(3)}</dd></div>
        <div><dt>Seuil fermeture</dt><dd>{state.threshold.toFixed(3)}</dd></div>
        <div><dt>FPS</dt><dd>{state.fps}</dd></div>
      </dl>
    </details>
  )
}
