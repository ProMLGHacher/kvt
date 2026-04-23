import { createContext } from 'react'
import type { ToastApi } from './toast-types'

export const ToastContext = createContext<ToastApi | null>(null)
