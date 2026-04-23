export function logInfo(scope: string, message: string, data?: unknown) {
  appendClientLog('info', scope, message, data)
  console.info(`[kvt][${scope}] ${message}`, data ?? '')
}

export function logWarn(scope: string, message: string, data?: unknown) {
  appendClientLog('warn', scope, message, data)
  console.warn(`[kvt][${scope}] ${message}`, data ?? '')
}

export function logError(scope: string, message: string, data?: unknown) {
  appendClientLog('error', scope, message, data)
  console.error(`[kvt][${scope}] ${message}`, data ?? '')
}

const storageKey = 'kvt.rooms.client-logs'
const maxEntries = 1000

function appendClientLog(level: 'info' | 'warn' | 'error', scope: string, message: string, data?: unknown) {
  if (typeof localStorage === 'undefined') {
    return
  }

  try {
    const entries = readEntries()
    const next = [
      ...entries,
      {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        level,
        scope,
        message,
        data: toSerializableData(data)
      }
    ].slice(-maxEntries)
    localStorage.setItem(storageKey, JSON.stringify(next))
  } catch {
    // Logging must never break the media path.
  }
}

function readEntries(): unknown[] {
  const stored = localStorage.getItem(storageKey)
  if (!stored) {
    return []
  }

  const parsed = JSON.parse(stored)
  return Array.isArray(parsed) ? parsed : []
}

function toSerializableData(data: unknown): unknown {
  if (data instanceof Error) {
    return {
      name: data.name,
      message: data.message,
      stack: data.stack
    }
  }

  return data
}
