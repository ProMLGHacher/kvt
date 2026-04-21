import type { Flow } from '@kvt/core'
import { useEffect, useRef } from 'react'

/**
 * Subscribes React components to one-off ViewModel events.
 *
 * The latest handler is kept in a ref so event subscriptions do not churn on
 * every render.
 */
export function useSharedFlow<T>(flow: Flow<T>, handler: (value: T) => void) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const subscription = flow.subscribe((value) => {
      handlerRef.current(value)
    })

    return () => subscription.dispose()
  }, [flow])
}
