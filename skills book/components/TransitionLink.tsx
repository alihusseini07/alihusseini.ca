'use client'

import { ReactNode, CSSProperties } from 'react'
import { useNavigate } from './TransitionProvider'

export default function TransitionLink({
  href, children, style, className,
}: {
  href: string
  children: ReactNode
  style?: CSSProperties
  className?: string
}) {
  const navigate = useNavigate()
  return (
    <a
      href={href}
      style={style}
      className={className}
      onClick={(e) => { e.preventDefault(); navigate(href) }}
    >
      {children}
    </a>
  )
}
