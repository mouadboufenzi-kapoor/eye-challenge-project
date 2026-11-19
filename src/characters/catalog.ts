import meta from './first-character/meta.json'
import eyesOpen from './first-character/eyes-open.svg'
import eyesClosed from './first-character/eyes-closed.svg'
import laugh from './first-character/laugh.svg'

export interface CharacterDefinition {
  id: string
  name: string
  category: string
  reaction: string
  colors: {
    background: string
    primary: string
    secondary: string
  }
  assets: {
    eyesOpen: string
    eyesClosed: string
    laugh: string
  }
}

export const FIRST_CHARACTER: CharacterDefinition = {
  ...meta,
  assets: {
    eyesOpen,
    eyesClosed,
    laugh,
  },
}
