import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes } from 'react'
import { cn } from '../utils'
import { buttonClassName, type ButtonSize, type ButtonVariant } from './action-styles'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => (
    <button ref={ref} className={buttonClassName({ variant, size, className })} {...props} />
  )
)
Button.displayName = 'Button'

export function ButtonGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-xl border border-border bg-surface p-1',
        className
      )}
      role="group"
      {...props}
    />
  )
}

export function Toggle({
  className,
  'aria-pressed': pressed,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        'inline-flex min-h-10 items-center justify-center rounded-lg border border-border px-3 text-sm font-semibold transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        pressed && 'border-primary bg-primary text-primary-foreground',
        className
      )}
      {...props}
    />
  )
}

export function ToggleGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="group"
      className={cn(
        'inline-flex items-center gap-1 rounded-xl border border-border bg-surface p-1',
        className
      )}
      {...props}
    />
  )
}
