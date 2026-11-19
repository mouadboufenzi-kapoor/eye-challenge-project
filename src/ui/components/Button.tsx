import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  tone?: 'primary' | 'cream' | 'ink'
}

export function Button({ children, tone = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`ui-button ui-button-${tone} ${className}`.trim()}
      type={props.type ?? 'button'}
      {...props}
    >
      {children}
    </button>
  )
}
