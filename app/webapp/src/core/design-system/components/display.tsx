import { forwardRef, type HTMLAttributes, type ReactNode, type VideoHTMLAttributes } from 'react'
import { cn } from '../utils'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive' | 'info'
}

const badgeVariants: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-muted/85 text-muted-foreground',
  secondary: 'bg-accent text-accent-foreground',
  success: 'bg-success text-on-feedback',
  warning: 'bg-warning text-slate-950',
  destructive: 'bg-destructive text-on-feedback',
  info: 'bg-info text-on-feedback'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-full border border-transparent px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide',
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  )
}

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: ReactNode
}

export function Avatar({ className, src, alt = '', fallback, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        'inline-grid size-10 place-items-center overflow-hidden rounded-full border border-white/10 bg-muted font-bold text-muted-foreground shadow-sm',
        className
      )}
      {...props}
    >
      {src ? <img src={src} alt={alt} className="size-full object-cover" /> : fallback}
    </div>
  )
}

export function AspectRatio({
  ratio = 16 / 9,
  className,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement> & { ratio?: number }) {
  return (
    <div
      className={cn('w-full overflow-hidden rounded-xl bg-muted', className)}
      style={{ ...style, aspectRatio: String(ratio) }}
      {...props}
    />
  )
}

export function Kbd({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <kbd
      className={cn(
        'rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground',
        className
      )}
      {...props}
    />
  )
}

export function Empty({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'grid min-h-48 place-items-center rounded-3xl border border-dashed border-border/80 bg-surface-elevated p-8 text-center text-muted-foreground backdrop-blur-xl',
        className
      )}
      {...props}
    />
  )
}

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />
}

export function Spinner({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        'inline-block size-4 animate-spin rounded-full border-2 border-muted border-t-primary',
        className
      )}
      {...props}
    />
  )
}

export interface KvatumLoaderProps extends HTMLAttributes<HTMLDivElement> {
  readonly label?: string
}

export function KvatumLoader({ className, label = 'Loading', ...props }: KvatumLoaderProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn('grid place-items-center text-foreground', className)}
      {...props}
    >
      <div className="kvatum-loader-scene relative grid size-36 place-items-center sm:size-40">
        <div className="kvatum-loader-halo absolute inset-2 rounded-full bg-primary/10 blur-2xl" />
        <svg
          aria-hidden="true"
          className="kvatum-loader-logo relative z-10 size-28 overflow-visible sm:size-32"
          fill="none"
          viewBox="0 0 128 128"
        >
          <path
            className="kvatum-loader-cloud"
            d="M64 24a40 40 0 1 1 0 80 40 40 0 0 1-18.4-4.5L29.3 105l4.6-15.6A39.8 39.8 0 0 1 24 64a40 40 0 0 1 40-40Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="6"
          />
          <path
            className="kvatum-loader-tail"
            d="M36.6 91.4 29.3 105l14.2-5.5c-2.7-.5-5.1-1.7-6.9-4.1Z"
            fill="currentColor"
          />
          <g className="kvatum-loader-eye" transform="translate(78.5 49.5)">
            <circle r="6.2" fill="var(--color-primary)" />
            <circle className="kvatum-loader-glint" cx="2" cy="-2" r="1.7" fill="white" />
          </g>
          <path
            className="kvatum-loader-smile"
            d="M78.5 75c2.3 2.5 4.7 3.8 7.3 3.8 1.2 0 2.3-.3 3.4-.8"
            stroke="var(--color-primary)"
            strokeLinecap="round"
            strokeWidth="4"
          />
          <circle className="kvatum-loader-dot kvatum-loader-dot-1" cx="24" cy="30" r="3" />
          <circle className="kvatum-loader-dot kvatum-loader-dot-2" cx="102" cy="38" r="2.5" />
          <circle className="kvatum-loader-dot kvatum-loader-dot-3" cx="100" cy="96" r="2.8" />
        </svg>
        <span className="sr-only">{label}</span>
      </div>
    </div>
  )
}

export const VideoAspectRatio = forwardRef<HTMLVideoElement, VideoHTMLAttributes<HTMLVideoElement>>(
  ({ className, ...props }, ref) => (
    <video
      ref={ref}
      className={cn('w-full overflow-hidden rounded-xl bg-muted', className)}
      {...props}
    />
  )
)
VideoAspectRatio.displayName = 'VideoAspectRatio'
