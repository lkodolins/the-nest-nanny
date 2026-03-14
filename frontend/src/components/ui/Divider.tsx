import { cn } from '@/lib/utils/cn'

interface DividerProps {
  className?: string
}

export function Divider({ className }: DividerProps) {
  return <hr className={cn('border-t border-cream-300', className)} />
}

export default Divider
