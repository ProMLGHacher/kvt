export type RmsLogLevel = 'info' | 'warn' | 'error'

export type RmsLogSink = (
  level: RmsLogLevel,
  scope: string,
  message: string,
  data?: unknown
) => void

let sink: RmsLogSink | null = null

export function setRmsLogSink(nextSink: RmsLogSink | null): void {
  sink = nextSink
}

export function logInfo(scope: string, message: string, data?: unknown) {
  emitLog('info', scope, message, data)
}

export function logWarn(scope: string, message: string, data?: unknown) {
  emitLog('warn', scope, message, data)
}

export function logError(scope: string, message: string, data?: unknown) {
  emitLog('error', scope, message, data)
}

function emitLog(level: RmsLogLevel, scope: string, message: string, data?: unknown): void {
  sink?.(level, scope, message, data)

  if (level === 'error') {
    console.error(`[kvatum-rms][${scope}] ${message}`, data ?? '')
    return
  }

  if (level === 'warn') {
    console.warn(`[kvatum-rms][${scope}] ${message}`, data ?? '')
    return
  }

  console.info(`[kvatum-rms][${scope}] ${message}`, data ?? '')
}
