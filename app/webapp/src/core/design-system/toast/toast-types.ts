import type { ReactNode } from 'react'

export type ToastVariant = 'default' | 'success' | 'warning' | 'destructive' | 'info'

export type ToastAction = {
  readonly label: string
  readonly onClick: () => void
  readonly dismissOnClick?: boolean
}

export type ToastOptions = {
  readonly id?: string
  readonly title?: ReactNode
  readonly description?: ReactNode
  readonly variant?: ToastVariant
  readonly durationMs?: number
  readonly dismissible?: boolean
  readonly action?: ToastAction
}

export type ToastInput = string | ToastOptions

export type ToastItem = Required<Pick<ToastOptions, 'id' | 'variant' | 'dismissible'>> &
  Omit<ToastOptions, 'id' | 'variant' | 'dismissible'>

export type ToastApi = {
  readonly toast: (input: ToastInput) => string
  readonly success: (input: ToastInput) => string
  readonly info: (input: ToastInput) => string
  readonly warning: (input: ToastInput) => string
  readonly error: (input: ToastInput) => string
  readonly dismiss: (id: string) => void
  readonly clear: () => void
}
