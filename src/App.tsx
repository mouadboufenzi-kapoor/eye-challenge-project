import { useEffect, useMemo, useRef, useState } from 'react'
import { MediaPipeEyeTracker } from './input/mediapipe'
import type { EyeState } from './input/eyeTracker'
import { EyeGameController } from './game/controller'
import { GameEngine, type GameState } from './game/engine'
import { readBestScore, saveBestScore } from './storage/bestScore'
import './style.css'

type Phase = 'idle' | 'starting' | 'close' | 'open' | 'ready' | 'error'

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
  const samplesRef = useRef<number[]>([])
  const faceSamplesRef = useRef(0)
  const stateRef = useRef(initialState)
  const calibrationRef = useRef({ open: 0, closed: 0 })
  const timerRef = useRef<number | null>(null)
  const debug = useMemo(() => new URLSearchParams(window.location.search).get('debug') === '1', [])
  const [phase, setPhase] = useState<Phase>('idle')
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

  const bothClosed = state.leftClosed && state.rightClosed
  const statusText = phase === 'ready' ? (bothClosed ? 'FERMÉS' : 'OUVERTS') : ''
  const startGame = () => {
    gameControllerRef.current?.beginCalibration()
    gameControllerRef.current?.finishCalibration()
  }
  const resetGame = () => {
    gameControllerRef.current?.reset()
    setGameState(initialGameState)
  }

  return (
    <main>
      <video ref={videoRef} className="hidden-video" autoPlay muted playsInline />
      <section className="card">
        <p className="eyebrow">Prototype technique · étape 2</p>
        <h1>Détection des yeux</h1>
        <p className="privacy">
          La vidéo reste sur ton téléphone, rien n'est envoyé ni stocké.
        </p>

        {phase === 'idle' && (
          <div className="panel">
            <p>Autorise la caméra frontale pour tester la détection en direct.</p>
            <button onClick={() => void start()}>Activer la caméra</button>
          </div>
        )}

        {phase === 'starting' && <StatusPanel>Initialisation de la caméra…</StatusPanel>}

        {(phase === 'close' || phase === 'open') && (
          <div className="panel calibration">
            <span className="step">Calibration {phase === 'close' ? '1' : '2'} / 2</span>
            <h2>{phase === 'close' ? 'Ferme les yeux' : 'Ouvre les yeux'}</h2>
            <strong>{remaining}</strong>
            <p>Garde cette position pendant 2 secondes.</p>
          </div>
        )}

        {phase === 'ready' && (
          <div className="panel result">
            <div className={`eye-state ${bothClosed ? 'closed' : 'open'}`}>
              {statusText}
            </div>
            <p className="face">
              <span className={state.faceDetected ? 'dot detected' : 'dot'} />
              {state.faceDetected ? 'Visage détecté' : 'Visage non détecté'}
            </p>
            {!state.faceDetected && (
              <p className="hint">Place ton visage face à la caméra et améliore la lumière.</p>
            )}
            {gameState.phase === 'idle' && (
              <button onClick={startGame}>Lancer le test de jeu</button>
            )}
          </div>
        )}

        {gameState.phase !== 'idle' && (
          <div className="panel game-panel">
            <span className="step">Test du moteur de jeu</span>
            {gameState.phase === 'countdown' && (
              <h2>Départ dans {Math.ceil(gameState.countdownRemainingMs / 1000)}</h2>
            )}
            {gameState.phase === 'playing' && (
              <>
                <h2>{gameState.characterEyes === 'open' ? 'Le personnage regarde' : 'Le personnage ferme les yeux'}</h2>
                <p className="score">Score : {Math.round(gameState.score)}</p>
                <p className="best-score">Meilleur score : {Math.round(bestScore)}</p>
              </>
            )}
            {gameState.phase === 'lost' && (
              <>
                <h2>Perdu</h2>
                <p className="score">Score : {Math.round(gameState.score)}</p>
                <p className="best-score">Meilleur score : {Math.round(bestScore)}</p>
                <button onClick={resetGame}>Recommencer</button>
              </>
            )}
            {gameState.phase === 'won' && (
              <>
                <h2>Gagné</h2>
                <p className="score">Score : {Math.round(gameState.score)}</p>
                <p className="best-score">Meilleur score : {Math.round(bestScore)}</p>
                <button onClick={resetGame}>Recommencer</button>
              </>
            )}
          </div>
        )}

        {phase === 'error' && (
          <div className="panel error-panel">
            <h2>Impossible de démarrer</h2>
            <p>{error}</p>
            <button onClick={() => void start()}>Réessayer</button>
          </div>
        )}

        {debug && phase !== 'idle' && (
          <details className="debug" open>
            <summary>Debug MediaPipe</summary>
            <dl>
              <div><dt>eyeBlinkLeft</dt><dd>{state.leftBlink.toFixed(3)}</dd></div>
              <div><dt>eyeBlinkRight</dt><dd>{state.rightBlink.toFixed(3)}</dd></div>
              <div><dt>Seuil fermeture</dt><dd>{state.threshold.toFixed(3)}</dd></div>
              <div><dt>FPS</dt><dd>{state.fps}</dd></div>
            </dl>
          </details>
        )}
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
