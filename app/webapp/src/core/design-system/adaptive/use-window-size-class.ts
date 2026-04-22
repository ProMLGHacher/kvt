import { useSyncExternalStore } from 'react'
import { createWindowSizeClass } from './window-size'

const fallbackWindowSizeClass = createWindowSizeClass(1024, 768)

function subscribeToWindowResize(onStoreChange: () => void) {
  window.addEventListener('resize', onStoreChange)
  window.addEventListener('orientationchange', onStoreChange)

  return () => {
    window.removeEventListener('resize', onStoreChange)
    window.removeEventListener('orientationchange', onStoreChange)
  }
}

function readWindowSizeClass() {
  if (typeof window === 'undefined') return fallbackWindowSizeClass
  return createWindowSizeClass(window.innerWidth, window.innerHeight)
}

export function useWindowSizeClass() {
  return useSyncExternalStore(
    subscribeToWindowResize,
    readWindowSizeClass,
    () => fallbackWindowSizeClass
  )
}
