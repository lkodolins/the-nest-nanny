import { type TextareaHTMLAttributes, forwardRef, useId } from 'react'
import { cn } from '@/lib/utils/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...rest }, ref) => {
    const autoId = useId()
    const textareaId = id ?? autoId

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-charcoal"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full rounded-lg border bg-cream-200 px-4 py-2.5 text-sm text-charcoal placeholder:text-charcoal-muted transition-all duration-200 outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400 min-h-[100px] resize-y',
            error
              ? 'border-error-500 focus:ring-error-500 focus:border-error-500'
              : 'border-warm-300',
            className,
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...rest}
        />
        {error && (
          <p id={`${textareaId}-error`} className="text-xs text-error-500">
            {error}
          </p>
        )}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'

export default Textarea
