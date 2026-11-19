export interface GameAudio {
  start(): void
  setIntensity(score: number, maximumScore: number): void
  stop(): void
}

export class WebAudioGameAudio implements GameAudio {
  private context: AudioContext | null = null
  private oscillator: OscillatorNode | null = null
  private gain: GainNode | null = null
  private intervalId: number | null = null
  private intensity = 0

  start(): void {
    if (typeof window === 'undefined' || !('AudioContext' in window)) return

    this.context ??= new AudioContext()
    void this.context.resume()
    if (this.oscillator) return

    this.gain = this.context.createGain()
    this.gain.gain.value = 0
    this.gain.connect(this.context.destination)

    this.oscillator = this.context.createOscillator()
    this.oscillator.type = 'sine'
    this.oscillator.frequency.value = 220
    this.oscillator.connect(this.gain)
    this.oscillator.start()
    this.intervalId = window.setInterval(() => this.pulse(), 500)
  }

  setIntensity(score: number, maximumScore: number): void {
    this.intensity = Math.min(1, Math.max(0, score / maximumScore))
    if (!this.context || !this.oscillator || !this.gain) return

    const now = this.context.currentTime
    this.oscillator.frequency.setTargetAtTime(
      220 + this.intensity * 220,
      now,
      0.08,
    )
    this.gain.gain.setTargetAtTime(0.015 + this.intensity * 0.02, now, 0.08)
  }

  stop(): void {
    if (this.intervalId !== null) window.clearInterval(this.intervalId)
    this.intervalId = null
    if (this.context && this.gain) {
      this.gain.gain.setTargetAtTime(0, this.context.currentTime, 0.05)
    }
    if (this.oscillator) {
      this.oscillator.stop()
      this.oscillator.disconnect()
    }
    this.oscillator = null
    this.gain?.disconnect()
    this.gain = null
  }

  private pulse(): void {
    if (!this.context || !this.gain) return
    const now = this.context.currentTime
    const duration = 0.05 + this.intensity * 0.05
    this.gain.gain.cancelScheduledValues(now)
    this.gain.gain.setValueAtTime(0.005 + this.intensity * 0.01, now)
    this.gain.gain.linearRampToValueAtTime(0, now + duration)
  }
}
