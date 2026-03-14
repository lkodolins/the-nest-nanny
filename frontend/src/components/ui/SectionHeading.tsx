import { type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface SectionHeadingProps {
  children: ReactNode
  className?: string
  centered?: boolean
}

export function SectionHeading({
  children,
  className,
  centered = false,
}: SectionHeadingProps) {
  return (
    <h2
      className={cn(
        'section-heading',
        centered && 'text-center',
        className,
      )}
    >
      {children}
    </h2>
  )
}

export default SectionHeading
