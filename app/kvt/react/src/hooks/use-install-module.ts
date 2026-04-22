import type { LazyModuleLoader } from '@kvt/core'
import { useEffect, useState } from 'react'
import { useKvt } from './use-kvt'

export interface ModuleInstallState {
  readonly ready: boolean
  readonly error: Error | null
}

/**
 * Installs a lazy DI module for code-split feature routes.
 *
 * Pair it with `React.lazy(() => import('./feature/Page'))`: the page chunk
 * loads first, then its DI module can register feature-scoped providers.
 */
export function useInstallModule(key: string, loader: LazyModuleLoader): ModuleInstallState {
  const { container } = useKvt()
  const [state, setState] = useState<ModuleInstallState>({ ready: false, error: null })

  useEffect(() => {
    let active = true
    setState({ ready: false, error: null })

    container
      .loadModule(key, loader)
      .then(() => {
        if (active) {
          setState({ ready: true, error: null })
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setState({
            ready: false,
            error: error instanceof Error ? error : new Error(String(error))
          })
        }
      })

    return () => {
      active = false
    }
  }, [container, key, loader])

  return state
}
