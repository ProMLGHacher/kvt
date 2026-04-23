import { useContext } from 'react'
import { ToastContext } from './toast-context'
import type { ToastApi } from './toast-types'

export function useToast(): ToastApi {
  const api = useContext(ToastContext)
  if (!api) {
    throw new Error('useToast must be used inside ToastProvider.')
  }
  return api
}
