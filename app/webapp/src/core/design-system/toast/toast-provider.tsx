import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Button } from '../components/actions'
import { Toast, ToastViewport } from '../components/feedback'
import { cn } from '../utils'
import { ToastContext } from './toast-context'
import type { ToastApi, ToastInput, ToastItem, ToastOptions, ToastVariant } from './toast-types'

const DEFAULT_DURATION_MS = 3600
const MAX_VISIBLE_TOASTS = 5

const variantClassName: Record<ToastVariant, string> = {
  default: '',
  success: 'border-success/60',
  warning: 'border-warning/70',
  destructive: 'border-destructive/70',
  info: 'border-info/70'
}

export function ToastProvider({ children }: { readonly children: ReactNode }) {
  const [items, setItems] = useState<readonly ToastItem[]>([])
  const timersRef = useRef(new Map<string, number>())
  const idRef = useRef(0)

  function dismiss(id: string) {
    const timerId = timersRef.current.get(id)
    if (timerId) {
      window.clearTimeout(timerId)
      timersRef.current.delete(id)
    }
    setItems((current) => current.filter((item) => item.id !== id))
  }

  function clear() {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId))
    timersRef.current.clear()
    setItems([])
  }

  function toast(input: ToastInput): string {
    return enqueue(input, 'default')
  }

  function success(input: ToastInput): string {
    return enqueue(input, 'success')
  }

  function info(input: ToastInput): string {
    return enqueue(input, 'info')
  }

  function warning(input: ToastInput): string {
    return enqueue(input, 'warning')
  }

  function error(input: ToastInput): string {
    return enqueue(input, 'destructive')
  }

  function enqueue(input: ToastInput, fallbackVariant: ToastVariant): string {
    const next = normalizeToast(input, fallbackVariant, () => `toast-${Date.now()}-${idRef.current++}`)
    setItems((current) => [...current.filter((item) => item.id !== next.id), next].slice(-MAX_VISIBLE_TOASTS))

    if (next.durationMs !== 0) {
      const timerId = window.setTimeout(() => dismiss(next.id), next.durationMs ?? DEFAULT_DURATION_MS)
      timersRef.current.set(next.id, timerId)
    }

    return next.id
  }

  useEffect(() => clear, [])

  const api: ToastApi = {
    toast,
    success,
    info,
    warning,
    error,
    dismiss,
    clear
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport>
        {items.map((item) => (
          <Toast
            key={item.id}
            className={cn(
              'animate-in slide-in-from-bottom-2 grid gap-3',
              variantClassName[item.variant]
            )}
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                {item.title && (
                  <p className="font-display text-sm font-bold tracking-tight">{item.title}</p>
                )}
                {item.description && (
                  <p className={cn('text-sm leading-5', Boolean(item.title) && 'mt-1')}>
                    {item.description}
                  </p>
                )}
              </div>
              {item.dismissible && (
                <button
                  aria-label="Dismiss notification"
                  className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-surface-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => dismiss(item.id)}
                  type="button"
                >
                  ×
                </button>
              )}
            </div>
            {item.action && (
              <Button
                className="justify-self-start"
                onClick={() => {
                  item.action?.onClick()
                  if (item.action?.dismissOnClick !== false) {
                    dismiss(item.id)
                  }
                }}
                size="sm"
                type="button"
                variant="outline"
              >
                {item.action.label}
              </Button>
            )}
          </Toast>
        ))}
      </ToastViewport>
    </ToastContext.Provider>
  )
}

function normalizeToast(
  input: ToastInput,
  fallbackVariant: ToastVariant,
  createId: () => string
): ToastItem {
  const options: ToastOptions = typeof input === 'string' ? { description: input } : input

  return {
    id: options.id ?? createId(),
    title: options.title,
    description: options.description,
    variant: options.variant ?? fallbackVariant,
    durationMs: options.durationMs ?? DEFAULT_DURATION_MS,
    dismissible: options.dismissible ?? true,
    action: options.action
  }
}
