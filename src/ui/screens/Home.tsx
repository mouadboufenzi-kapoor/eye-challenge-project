import type { TouchEvent } from 'react'
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react'
import { DEFAULT_CHARACTER, characters } from '../../characters/registry'
import { CharacterView } from '../CharacterView'
import { Button } from '../components/Button'
import { strings } from '../strings.fr'

interface HomeProps {
  record: number
  selectedIndex: number
  onSelect: (index: number) => void
  onPlay: () => void
}

export function Home({ record, selectedIndex, onSelect, onPlay }: HomeProps) {
  const selected = characters[selectedIndex] ?? DEFAULT_CHARACTER
  if (!selected) return null

  const touchStartX = { current: 0 }
  const onTouchStart = (event: TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? 0
  }
  const onTouchEnd = (event: TouchEvent) => {
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current
    const distance = endX - touchStartX.current
    if (Math.abs(distance) < 40) return
    const direction = distance < 0 ? 1 : -1
    onSelect((selectedIndex + direction + characters.length) % characters.length)
  }

  const move = (direction: number) => {
    onSelect((selectedIndex + direction + characters.length) % characters.length)
  }

  return (
    <main className="poster-screen home-screen" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <header className="poster-header">
        <div className="record-pill">
          <Trophy size={16} strokeWidth={2.4} />
          <span>{record > 0 ? `${strings.record} : ${Math.round(record)} s` : strings.noRecord}</span>
        </div>
        <div className="parody-pill">{strings.parody}</div>
      </header>
      <CharacterView
        character={selected}
        eyes="open"
        className="poster-character"
      />
      <section className="home-panel">
        <div className="character-picker">
          <button className="arrow-button" onClick={() => move(-1)} aria-label="Personnage précédent">
            <ChevronLeft size={26} strokeWidth={3} />
          </button>
          <div>
            <strong className="character-name">{selected.name}</strong>
            <div className="character-dots" aria-label={`${selectedIndex + 1} sur ${characters.length}`}>
              {characters.map((character, index) => (
                <span key={character.id} className={index === selectedIndex ? 'active' : ''} />
              ))}
            </div>
          </div>
          <button className="arrow-button" onClick={() => move(1)} aria-label="Personnage suivant">
            <ChevronRight size={26} strokeWidth={3} />
          </button>
        </div>
        <div className="home-copy">
          <h1>{strings.title}</h1>
          <p>{strings.homeSubtitle}</p>
        </div>
        <Button className="home-play" onClick={onPlay}>{strings.play}</Button>
        <p className="camera-privacy">{strings.cameraPrivacy}</p>
      </section>
    </main>
  )
}
