export type UIScreen =
  | 'home'
  | 'rules'
  | 'countdown'
  | 'playing'
  | 'result'

export type ResultKind = 'lost' | 'won'

export interface UIFlowState {
  screen: UIScreen
  resultKind: ResultKind | null
}

export const INITIAL_UI_FLOW: UIFlowState = {
  screen: 'home',
  resultKind: null,
}

export function transitionToRules(state: UIFlowState): UIFlowState {
  return { ...state, screen: 'rules', resultKind: null }
}

export function transitionToCountdown(state: UIFlowState): UIFlowState {
  return { ...state, screen: 'countdown', resultKind: null }
}

export function transitionToPlaying(state: UIFlowState): UIFlowState {
  return { ...state, screen: 'playing', resultKind: null }
}

export function transitionToResult(
  state: UIFlowState,
  kind: ResultKind,
): UIFlowState {
  return { ...state, screen: 'result', resultKind: kind }
}

export function transitionToHome(): UIFlowState {
  return { ...INITIAL_UI_FLOW }
}
