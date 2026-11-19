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
    viewBox?: [number, number, number, number]
    fit: 'cover' | 'contain'
    position?: string
    positionX?: number
    positionY?: number
    zoom?: number
    overflow?: string
    anchorLeftEye?: [number, number]
    anchorRightEye?: [number, number]
    anchorMouth?: [number, number]
  }
  eyeRegion?: { x: number; y: number; w: number; h: number; feather: number }
  eyeAnchors?: {
    left: { x: number; y: number }
    right: { x: number; y: number }
  }
  mouth?: { x: number; y: number }
  align?: Record<string, { dx: number; dy: number; scale: number; rotate: number }>
  transition?: { mode: 'mask' | 'full'; durationOpenMs?: number; durationCloseMs?: number; easing?: string; lid?: boolean }
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
    win: string
    eyesHalf: string
  }
}

const metaFiles = import.meta.glob<CharacterMeta>('./*/meta.json', {
  eager: true,
  import: 'default',
})

const eyesOpenFiles = import.meta.glob<string>('./*/eyes-open.*', {
  eager: true,
  import: 'default',
})

const eyesClosedFiles = import.meta.glob<string>('./*/eyes-closed.*', {
  eager: true,
  import: 'default',
})

const laughFiles = import.meta.glob<string>('./*/laugh.*', {
  eager: true,
  import: 'default',
})

const winFiles = import.meta.glob<string>('./*/win.*', {
  eager: true,
  import: 'default',
})

const halfFiles = import.meta.glob<string>('./*/eyes-half.*', {
  eager: true,
  import: 'default',
})

export const characters: CharacterDefinition[] = Object.entries(metaFiles).map(
  ([metaPath, meta]) => {
    const folder = metaPath.slice(0, metaPath.lastIndexOf('/'))
    return {
      ...meta,
      assets: {
        eyesOpen: findAsset(eyesOpenFiles, folder, 'eyes-open') ?? '',
        eyesClosed: findAsset(eyesClosedFiles, folder, 'eyes-closed') ?? '',
        laugh: findAsset(laughFiles, folder, 'laugh') ?? '',
        win: findAsset(winFiles, folder, 'win') ?? '',
        eyesHalf: findAsset(halfFiles, folder, 'eyes-half') ?? '',
      },
    }
  },
).sort((a, b) => {
  if (a.id === 'trump') return -1
  if (b.id === 'trump') return 1
  return a.name.localeCompare(b.name)
})

export const DEFAULT_CHARACTER =
  characters.find((character) => character.id === 'trump')
  ?? characters.find((character) => character.id === 'tribun')
  ?? characters[0]

function findAsset(
  files: Record<string, string>,
  folder: string,
  prefix: string,
): string | undefined {
  return Object.entries(files).find(([path]) =>
    path.startsWith(`${folder}/${prefix}.`),
  )?.[1]
}
