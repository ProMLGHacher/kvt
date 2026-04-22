import { type HTMLAttributes, type LiHTMLAttributes } from 'react'
import { cn } from '../utils'

export function Breadcrumb({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

export function BreadcrumbList({ className, ...props }: HTMLAttributes<HTMLOListElement>) {
  return <ol className={cn('flex list-none items-center gap-2 p-0', className)} {...props} />
}

export function BreadcrumbItem({ className, ...props }: LiHTMLAttributes<HTMLLIElement>) {
  return <li className={cn('inline-flex items-center gap-2', className)} {...props} />
}

export function Pagination({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <nav aria-label="Pagination" className={cn('flex items-center gap-2', className)} {...props} />
  )
}

export function NavigationMenu({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div role="menubar" className={cn('flex items-center gap-2', className)} {...props} />
}

export function Menubar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="menubar"
      className={cn(
        'flex items-center gap-1 rounded-xl border border-border bg-surface p-1',
        className
      )}
      {...props}
    />
  )
}

export function Tabs({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('grid gap-4', className)} {...props} />
}

export function TabsList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 rounded-xl border border-border bg-surface p-1',
        className
      )}
      {...props}
    />
  )
}

export function TabsTrigger({
  className,
  selected,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      className={cn(
        'rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        selected && 'bg-primary text-primary-foreground',
        className
      )}
      {...props}
    />
  )
}

export function TabsPanel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tabpanel"
      className={cn('rounded-xl border border-border p-4', className)}
      {...props}
    />
  )
}
