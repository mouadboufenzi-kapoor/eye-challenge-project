import { useEffect, useRef, useState } from 'react'
import { MediaPipeEyeTracker } from './input/mediapipe'
import type { EyeState } from './input/eyeTracker'
import { readBlinkCalibration, saveBlinkCalibration } from './input/calibration'
import { EyeGameController } from './game/controller'
import { GameEngine, type GameState } from './game/engine'
import { DEFAULT_GAME_CONFIG } from './game/config'
import { readBestScore, saveBestScore } from './storage/bestScore'
import { WebAudioGameAudio } from './audio/gameAudio'
import {
  INITIAL_UI_FLOW,
  transitionToCountdown,
  transitionToHome,
  transitionToPlaying,
  transitionToResult,
  transitionToRules,
  type UIFlowState,
} from './ui/flow'
import { Home } from './ui/screens/Home'
import { Rules } from './ui/screens/Rules'
import { Countdown } from './ui/screens/Countdown'
import { Playing } from './ui/screens/Playing'
import { Result } from './ui/screens/Result'
import { strings } from './ui/strings.fr'

const initialEyeState: EyeState = {
  leftClosed: false,
  rightClosed: false,
  confidence: 0,
  faceDetected: false,
  leftBlink: 0,
  rightBlink: 0,
  threshold: 0.5,
  fps: 0,
}

const initialGameState: GameState = {
  phase: 'idle',
  characterEyes: 'closed',
  score: 0,
  countdownRemainingMs: 0,
  elapsedMs: 0,
  lossOverlapMs: 0,
}

function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const trackerRef = useRef<MediaPipeEyeTracker | null>(null)
  const controllerRef = useRef<EyeGameController | null>(null)
  const audioRef = useRef(new WebAudioGameAudio())
  const blinkSamplesRef = useRef<number[]>([])
  const flowRef = useRef<UIFlowState>(INITIAL_UI_FLOW)
  const calibrationAppliedRef = useRef(false)

  const [flow, setFlow] = useState(INITIAL_UI_FLOW)
  const [selectedCharacter, setSelectedCharacter] = useState(0)
  const [eyeState, setEyeState] = useState(initialEyeState)
  const [gameState, setGameState] = useState(initialGameState)
  const [record, setRecord] = useState(() => readBestScore())
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraLoading, setCameraLoading] = useState(false)
  const [countdownBlocked, setCountdownBlocked] = useState(false)

  useEffect(() => {
    if (!videoRef.current) return
    const tracker = new MediaPipeEyeTracker(videoRef.current)
    trackerRef.current = tracker
    void tracker.preload?.().catch(() => undefined)

    return () => {
      controllerRef.current?.stop()
      tracker.stop()
      audioRef.current.stop()
    }
  }, [])

  useEffect(() => {
    flowRef.current = flow
  }, [flow])

  useEffect(() => {
    if (gameState.phase === 'playing') {
      audioRef.current.setIntensity(gameState.score, DEFAULT_GAME_CONFIG.scoreToWin)
    }
    if (gameState.phase === 'lost' || gameState.phase === 'won') {
      audioRef.current.stop()
      if (gameState.score > record) {
        const saved = saveBestScore(gameState.score)
        setRecord(saved)
      }
      setFlow((current) =>
        transitionToResult(current, gameState.phase === 'won' ? 'won' : 'lost'),
      )
    }
  }, [gameState.phase, gameState.score, record])

  useEffect(() => {
    if (gameState.phase !== 'playing') return
    if (flowRef.current.screen !== 'countdown') return
    if (calibrationAppliedRef.current) return

    const saved = readBlinkCalibration()
    let minimum = saved?.openMinimum
    let maximum = saved?.closedMaximum
    if (blinkSamplesRef.current.length > 0) {
      minimum = Math.min(...blinkSamplesRef.current)
      maximum = Math.max(...blinkSamplesRef.current)
      saveBlinkCalibration({ openMinimum: minimum, closedMaximum: maximum })
    }
    if (minimum !== undefined && maximum !== undefined) {
      trackerRef.current?.calibrate(minimum, maximum)
    }
    calibrationAppliedRef.current = true
    setCountdownBlocked(false)
    setFlow((current) => transitionToPlaying(current))
  }, [gameState.phase])

  const startCameraAndAudio = () => {
    audioRef.current.start()
    setFlow((current) => transitionToRules(current))
    setCameraError(null)
    setCameraLoading(true)
    blinkSamplesRef.current = []
    calibrationAppliedRef.current = false

    const video = videoRef.current
    if (!video) {
      setCameraError('Caméra indisponible.')
      setCameraLoading(false)
      return
    }

    const tracker = trackerRef.current ?? new MediaPipeEyeTracker(video)
    trackerRef.current = tracker
    tracker.onUpdate((state) => {
      setEyeState(state)
      if (flowRef.current.screen === 'countdown') {
        const blinkAverage = (state.leftBlink + state.rightBlink) / 2
        blinkSamplesRef.current.push(blinkAverage)
        if (blinkSamplesRef.current.length > 300) blinkSamplesRef.current.shift()
        const blocked = !state.faceDetected
        setCountdownBlocked(blocked)
        controllerRef.current?.setCountdownBlocked(blocked)
      }
    })

    const controller = new EyeGameController(new GameEngine(), tracker)
    controllerRef.current = controller
    controller.onUpdate((state) => setGameState(state))

    void controller.start().then(() => {
      setCameraLoading(false)
    }).catch((error: unknown) => {
      setCameraLoading(false)
      setCameraError(cameraErrorMessage(error))
      controller.stop()
    })
  }

  const beginCountdown = () => {
    if (!controllerRef.current) return
    if (!trackerRef.current) return
    controllerRef.current.beginCalibration()
    controllerRef.current.finishCalibration()
    blinkSamplesRef.current = []
    calibrationAppliedRef.current = false
    setFlow((current) => transitionToCountdown(current))
  }

  const replay = () => {
    controllerRef.current?.reset()
    controllerRef.current?.beginCalibration()
    controllerRef.current?.finishCalibration()
    blinkSamplesRef.current = []
    calibrationAppliedRef.current = false
    setFlow((current) => transitionToCountdown(current))
  }

  const goHome = () => {
    controllerRef.current?.reset()
    setFlow(transitionToHome())
  }

  const share = async () => {
    const text = `${strings.shareText} Score : ${Math.round(gameState.score)}`
    if (navigator.share) {
      await navigator.share({ title: strings.appName, text }).catch(() => undefined)
      return
    }
    await navigator.clipboard?.writeText(text)
  }

  const countdownValue = Math.max(
    1,
    Math.ceil(gameState.countdownRemainingMs / 1000),
  )

  return (
    <>
      <video ref={videoRef} className="hidden-video" autoPlay muted playsInline />
      {flow.screen === 'home' && (
        <Home
          record={record}
          selectedIndex={selectedCharacter}
          onSelect={setSelectedCharacter}
          onPlay={startCameraAndAudio}
        />
      )}
      {flow.screen === 'rules' && (
        <Rules
          characterIndex={selectedCharacter}
          error={cameraError}
          loading={cameraLoading}
          onStart={beginCountdown}
          onRetry={startCameraAndAudio}
        />
      )}
      {flow.screen === 'countdown' && (
        <Countdown value={countdownValue} blocked={countdownBlocked} />
      )}
      {flow.screen === 'playing' && (
        <Playing eyeState={eyeState} gameState={gameState} />
      )}
      {flow.screen === 'result' && (
        <Result
          kind={flow.resultKind ?? 'lost'}
          score={gameState.score}
          record={record}
          onReplay={replay}
          onShare={() => void share()}
          onHome={goHome}
        />
      )}
    </>
  )
}

function cameraErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message === 'CAMERA_DENIED') {
      return 'CAMÉRA REFUSÉE. Autorise la caméra dans les réglages du navigateur, puis réessaie.'
    }
    if (error.message === 'CAMERA_UNAVAILABLE') {
      return 'CAMÉRA INDISPONIBLE. Ferme les autres applications qui utilisent la caméra.'
    }
    if (error.message === 'CAMERA_CONSTRAINTS') {
      return 'CAMÉRA NON COMPATIBLE. Essaie avec un navigateur récent.'
    }
  }
  return 'CAMÉRA INDISPONIBLE. Vérifie HTTPS et réessaie.'
}

export default App
