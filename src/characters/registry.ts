interface CharacterMeta {
  id: string
  name: string
  category: string
  reaction: string
  colors: {
    background: string
    primary: string
    secondary: string
  }
  portrait: {
    viewBox: [number, number, number, number]
    fit: 'cover' | 'contain'
    position: string
    overflow: string
    anchorLeftEye: [number, number]
    anchorRightEye: [number, number]
    anchorMouth: [number, number]
  }
  difficulty: {
    openDuration: { min: number; max: number }
    closedDuration: { min: number; max: number }
  }
  grimaceOverrides: Record<string, { enabled: boolean }>
}

export interface CharacterDefinition extends CharacterMeta {
  assets: {
    eyesOpen: string
    eyesClosed: string
    laugh: string
  }
}

const metaFiles = import.meta.glob<CharacterMeta>('./*/meta.json', {
  eager: true,
  import: 'default',
})

const eyesOpenFiles = import.meta.glob<string>('./*/eyes-open.svg', {
  eager: true,
  import: 'default',
})

const eyesClosedFiles = import.meta.glob<string>('./*/eyes-closed.svg', {
  eager: true,
  import: 'default',
})

const laughFiles = import.meta.glob<string>('./*/laugh.svg', {
  eager: true,
  import: 'default',
})

export const characters: CharacterDefinition[] = Object.entries(metaFiles).map(
  ([metaPath, meta]) => {
    const folder = metaPath.slice(0, metaPath.lastIndexOf('/'))
    return {
      ...meta,
      assets: {
        eyesOpen: eyesOpenFiles[`${folder}/eyes-open.svg`] ?? '',
        eyesClosed: eyesClosedFiles[`${folder}/eyes-closed.svg`] ?? '',
        laugh: laughFiles[`${folder}/laugh.svg`] ?? '',
      },
    }
  },
)

export const DEFAULT_CHARACTER =
  characters.find((character) => character.id === 'tribun') ?? characters[0]
