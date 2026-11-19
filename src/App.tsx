import { useEffect, useMemo, useRef, useState } from 'react'
import { MediaPipeEyeTracker } from './input/mediapipe'
import type { EyeState } from './input/eyeTracker'
import { EyeGameController } from './game/controller'
import { GameEngine, type GameState } from './game/engine'
import { readBestScore, saveBestScore } from './storage/bestScore'
import { CalibrationPanel } from './ui/CalibrationPanel'
import { DebugPanel } from './ui/DebugPanel'
import { EyeStatusPanel } from './ui/EyeStatusPanel'
import { GameStatusPanel } from './ui/GameStatusPanel'
import { WebAudioGameAudio } from './audio/gameAudio'
import { RulesScreen } from './ui/RulesScreen'
import { StartScreen } from './ui/StartScreen'
import { CameraIntroScreen } from './ui/CameraIntroScreen'
import './style.css'

type Phase = 'start' | 'rules' | 'camera' | 'idle' | 'starting' | 'close' | 'open' | 'ready' | 'error'

const CALIBRATION_MS = 2000
const initialGameState: GameState = {
  phase: 'idle',
  characterEyes: 'closed',
  score: 0,
  countdownRemainingMs: 0,
  elapsedMs: 0,
  lossOverlapMs: 0,
}
const initialState: EyeState = {
  leftClosed: false,
  rightClosed: false,
  confidence: 0,
  faceDetected: false,
  leftBlink: 0,
  rightBlink: 0,
  threshold: 0.5,
  fps: 0,
}

function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const trackerRef = useRef<MediaPipeEyeTracker | null>(null)
  const gameControllerRef = useRef<EyeGameController | null>(null)
  const gameAudioRef = useRef(new WebAudioGameAudio())
  const samplesRef = useRef<number[]>([])
  const faceSamplesRef = useRef(0)
  const stateRef = useRef(initialState)
  const calibrationRef = useRef({ open: 0, closed: 0 })
  const timerRef = useRef<number | null>(null)
  const debug = useMemo(() => new URLSearchParams(window.location.search).get('debug') === '1', [])
  const [phase, setPhase] = useState<Phase>('start')
  const [remaining, setRemaining] = useState(0)
  const [state, setState] = useState(initialState)
  const [error, setError] = useState('')
  const [calibration, setCalibration] = useState({ open: 0, closed: 0 })
  const [gameState, setGameState] = useState(initialGameState)
  const [bestScore, setBestScore] = useState(() => readBestScore())

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
      gameControllerRef.current?.stop()
      gameAudioRef.current.stop()
    }
  }, [])

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    calibrationRef.current = calibration
  }, [calibration])

  useEffect(() => {
    if (gameState.phase !== 'won') return
    if (gameState.score <= bestScore) return
    setBestScore(saveBestScore(gameState.score))
  }, [bestScore, gameState.phase, gameState.score])

  useEffect(() => {
    if (gameState.phase === 'playing') {
      gameAudioRef.current.setIntensity(gameState.score, 100)
    }
    if (gameState.phase === 'lost' || gameState.phase === 'won' || gameState.phase === 'idle') {
      gameAudioRef.current.stop()
    }
  }, [gameState.phase, gameState.score])

  const start = async () => {
    if (!videoRef.current) return
    setPhase('starting')
    setError('')
    const tracker = new MediaPipeEyeTracker(videoRef.current)
    tracker.onUpdate(setState)
    trackerRef.current = tracker
    const gameController = new EyeGameController(new GameEngine(), tracker)
    gameController.onUpdate(setGameState)
    gameControllerRef.current = gameController
    try {
      await gameController.start()
      runCalibration('close')
    } catch (cause) {
      setPhase('error')
      setError(errorMessage(cause))
      gameController.stop()
    }
  }

  const runCalibration = (nextPhase: 'close' | 'open') => {
    samplesRef.current = []
    faceSamplesRef.current = 0
    setPhase(nextPhase)
    setRemaining(CALIBRATION_MS / 1000)
    const startedAt = performance.now()
    timerRef.current = window.setInterval(() => {
      const elapsed = performance.now() - startedAt
      setRemaining(Math.max(0, Math.ceil((CALIBRATION_MS - elapsed) / 1000)))
      if (elapsed < CALIBRATION_MS) {
        const currentState = stateRef.current
        samplesRef.current.push((currentState.leftBlink + currentState.rightBlink) / 2)
        if (currentState.faceDetected) faceSamplesRef.current += 1
        return
      }
      if (timerRef.current) window.clearInterval(timerRef.current)
      const average = averageOf(samplesRef.current)
      if (faceSamplesRef.current < 3) {
        setPhase('error')
        setError('Aucun visage détecté ou lumière insuffisante. Place ton visage face à la caméra et améliore la lumière.')
        return
      }
      setCalibration((current) => ({ ...current, [nextPhase]: average }))
      if (nextPhase === 'close') {
        calibrationRef.current = { ...calibrationRef.current, closed: average }
        runCalibration('open')
      } else {
        const closed = calibrationRef.current.closed || average
        const open = average
        trackerRef.current?.calibrate(open, closed)
        setPhase('ready')
      }
    }, 100)
  }

  const startGame = () => {
    gameAudioRef.current.start()
    gameControllerRef.current?.beginCalibration()
    gameControllerRef.current?.finishCalibration()
  }
  const resetGame = () => {
    gameControllerRef.current?.reset()
    setGameState(initialGameState)
  }

  const startFlow = () => setPhase('rules')
  const continueToCamera = () => setPhase('camera')
  const returnToStart = () => setPhase('start')
  const returnToRules = () => setPhase('rules')

  return (
    <main>
      <video ref={videoRef} className="hidden-video" autoPlay muted playsInline />
      <section className="card">
        <p className="eyebrow">Prototype technique · étape 2</p>
        <h1>Détection des yeux</h1>
        <p className="privacy">
          La vidéo reste sur ton téléphone, rien n'est envoyé ni stocké.
        </p>

        {phase === 'start' && <StartScreen onStart={startFlow} />}

        {phase === 'rules' && (
          <RulesScreen onContinue={continueToCamera} onBack={returnToStart} />
        )}

        {phase === 'camera' && (
          <CameraIntroScreen onAllow={() => setPhase('idle')} onBack={returnToRules} />
        )}

        {phase === 'idle' && (
          <div className="panel">
            <p>Autorise la caméra frontale pour tester la détection en direct.</p>
            <button onClick={() => void start()}>Activer la caméra</button>
          </div>
        )}

        {phase === 'starting' && <StatusPanel>Initialisation de la caméra…</StatusPanel>}

        {(phase === 'close' || phase === 'open') && (
          <CalibrationPanel step={phase} remaining={remaining} />
        )}

        {phase === 'ready' && (
          <EyeStatusPanel state={state} onStartGame={startGame} />
        )}

        <GameStatusPanel state={gameState} bestScore={bestScore} onReset={resetGame} />

        {phase === 'error' && (
          <div className="panel error-panel">
            <h2>Impossible de démarrer</h2>
            <p>{error}</p>
            <button onClick={() => void start()}>Réessayer</button>
          </div>
        )}

        <DebugPanel state={state} visible={debug && phase !== 'idle'} />
      </section>
    </main>
  )
}

function StatusPanel({ children }: { children: string }) {
  return <div className="panel loading"><span className="spinner" />{children}</div>
}

function averageOf(values: number[]): number {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function errorMessage(cause: unknown): string {
  if (cause instanceof Error && cause.message === 'CAMERA_DENIED') {
    return 'Accès caméra refusé. Autorise la caméra dans les réglages du navigateur, puis réessaie.'
  }
  if (cause instanceof Error && cause.message === 'CAMERA_UNSUPPORTED') {
    return 'Ce navigateur ne permet pas l’accès à la caméra. Essaie sur un navigateur récent en HTTPS.'
  }
  return 'La caméra ou le modèle de détection n’a pas pu démarrer. Vérifie le HTTPS et réessaie.'
}

export default App
