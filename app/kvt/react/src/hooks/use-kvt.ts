import type { KvtRuntime } from '@kvt/core'
import { useContext } from 'react'
import { KvtContext } from '../provider/kvt-provider'

/**
 * Reads the current KVT runtime from React context.
 *
 * Keeping this as the only context access point makes application hooks and
 * screens depend on a stable runtime contract instead of provider internals.
 */
export function useKvt(): KvtRuntime {
  const runtime = useContext(KvtContext)
  if (!runtime) {
    throw new Error('useKvt must be used inside KvtProvider')
  }

  return runtime
}
