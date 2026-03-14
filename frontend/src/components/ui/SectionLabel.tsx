import { type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface SectionLabelProps {
  children: ReactNode
  className?: string
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <span className={cn('section-label', className)}>
      {children}
    </span>
  )
}

export default SectionLabel
