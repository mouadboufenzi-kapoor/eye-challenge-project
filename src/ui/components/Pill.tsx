import type { ReactNode } from 'react'

interface PillProps {
  children: ReactNode
  tone?: 'yellow' | 'green' | 'cream'
}

export function Pill({ children, tone = 'cream' }: PillProps) {
  return <span className={`ui-pill ui-pill-${tone}`}>{children}</span>
}
