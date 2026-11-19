import type { ReactNode } from 'react'

interface PopupProps {
  children: ReactNode
  title?: string
}

export function Popup({ children, title }: PopupProps) {
  return (
    <div className="ui-popup-backdrop" role="presentation">
      <section className="ui-popup" role="dialog" aria-modal="true" aria-label={title}>
        {title && <h2 className="ui-popup-title">{title}</h2>}
        {children}
      </section>
    </div>
  )
}
