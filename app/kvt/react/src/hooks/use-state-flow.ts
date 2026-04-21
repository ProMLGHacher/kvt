import type { StateFlow } from '@kvt/core'
import { useSyncExternalStore } from 'react'

/**
 * Bridges KVT StateFlow into React's concurrent-safe external store API.
 *
 * ViewModels can expose immutable UI state as StateFlow, while React remains in
 * charge of render scheduling.
 */
export function useStateFlow<T>(flow: StateFlow<T>): T {
  return useSyncExternalStore(
    (notify) => {
      const subscription = flow.subscribe(() => {
        notify()
      })
      return () => subscription.dispose()
    },
    () => flow.value,
    () => flow.value
  )
}
