const CALIBRATION_KEY = 'eye-challenge.blink-calibration'

export interface BlinkCalibration {
  openMinimum: number
  closedMaximum: number
}

export function readBlinkCalibration(): BlinkCalibration | null {
  try {
    const raw = localStorage.getItem(CALIBRATION_KEY)
    if (!raw) return null
    const value = JSON.parse(raw) as Partial<BlinkCalibration>
    if (
      typeof value.openMinimum !== 'number'
      || typeof value.closedMaximum !== 'number'
    ) return null
    return {
      openMinimum: value.openMinimum,
      closedMaximum: value.closedMaximum,
    }
  } catch {
    return null
  }
}

export function saveBlinkCalibration(calibration: BlinkCalibration): void {
  try {
    localStorage.setItem(CALIBRATION_KEY, JSON.stringify(calibration))
  } catch {
    // The game remains usable if localStorage is unavailable.
  }
}
