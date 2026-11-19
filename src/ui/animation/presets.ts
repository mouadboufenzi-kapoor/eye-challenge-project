export type GrimaceCurve = 'linear' | 'ease-out' | 'ease-in-out'

export interface GrimacePreset {
  id: 'scare' | 'twitch' | 'bulge'
  durationMs: number
  zoomStart: number
  zoomPeak: number
  zoomEnd: number
  shakeAmplitude: number
  eyeScaleY: number
  browLift: number
  veinOpacity: number
  curve: GrimaceCurve
}

export const grimacePresets: Record<GrimacePreset['id'], GrimacePreset> = {
  scare: {
    id: 'scare',
    durationMs: 420,
    zoomStart: 1,
    zoomPeak: 1.06,
    zoomEnd: 1.02,
    shakeAmplitude: 7,
    eyeScaleY: 1.18,
    browLift: 12,
    veinOpacity: 0.42,
    curve: 'ease-out',
  },
  twitch: {
    id: 'twitch',
    durationMs: 260,
    zoomStart: 1,
    zoomPeak: 1.025,
    zoomEnd: 1,
    shakeAmplitude: 3,
    eyeScaleY: 1.1,
    browLift: 7,
    veinOpacity: 0.28,
    curve: 'ease-in-out',
  },
  bulge: {
    id: 'bulge',
    durationMs: 520,
    zoomStart: 1,
    zoomPeak: 1.045,
    zoomEnd: 1.015,
    shakeAmplitude: 4,
    eyeScaleY: 1.28,
    browLift: 15,
    veinOpacity: 0.5,
    curve: 'ease-out',
  },
}
