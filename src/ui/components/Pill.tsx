import type { ReactNode } from 'react'

interface PillProps {
  children: ReactNode
  tone?: 'yellow' | 'green' | 'cream'
  className?: string
}

export function Pill({ children, tone = 'cream', className = '' }: PillProps) {
  return <span className={`ui-pill ui-pill-${tone} ${className}`.trim()}>{children}</span>
}
