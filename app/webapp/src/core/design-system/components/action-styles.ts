import { cn } from '../utils'

export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

export interface ButtonStyleOptions {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}

const buttonVariantClasses: Record<ButtonVariant, string> = {
  default: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  secondary: 'bg-accent text-accent-foreground hover:bg-muted',
  outline: 'border-border bg-transparent text-foreground hover:bg-muted',
  ghost: 'border-transparent bg-transparent text-foreground hover:bg-muted',
  destructive: 'bg-destructive text-on-feedback hover:opacity-90'
}

const buttonSizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-8 px-3 text-sm',
  md: 'min-h-10 px-4 text-sm',
  lg: 'min-h-12 px-5 text-base',
  icon: 'size-10 p-0'
}

export function buttonClassName({
  variant = 'default',
  size = 'md',
  className
}: ButtonStyleOptions = {}) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-lg border font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
    buttonVariantClasses[variant],
    buttonSizeClasses[size],
    className
  )
}
