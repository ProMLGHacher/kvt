import { createKvt, type KvtRuntime } from '@kvt/core'
import { createContext, type ReactNode, useEffect, useRef } from 'react'

export const KvtContext = createContext<KvtRuntime | null>(null)

export interface KvtProviderProps {
  runtime?: KvtRuntime
  children: ReactNode
}

/**
 * React boundary for KVT runtime ownership.
 *
 * If a runtime is passed from the outside, React only exposes it. If not, the
 * provider creates a runtime and disposes it together with the app tree.
 */
export function KvtProvider({ runtime, children }: KvtProviderProps) {
  const ownsRuntime = runtime === undefined
  const runtimeRef = useRef<KvtRuntime | null>(null)

  if (!runtimeRef.current) {
    runtimeRef.current = runtime ?? createKvt()
  }

  useEffect(() => {
    const currentRuntime = runtimeRef.current

    return () => {
      if (ownsRuntime) {
        currentRuntime?.dispose()
      }
    }
  }, [ownsRuntime])

  return <KvtContext.Provider value={runtimeRef.current}>{children}</KvtContext.Provider>
}
