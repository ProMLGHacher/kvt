export function logInfo(scope: string, message: string, data?: unknown) {
  console.info(`[kvt][${scope}] ${message}`, data ?? '')
}

export function logWarn(scope: string, message: string, data?: unknown) {
  console.warn(`[kvt][${scope}] ${message}`, data ?? '')
}

export function logError(scope: string, message: string, data?: unknown) {
  console.error(`[kvt][${scope}] ${message}`, data ?? '')
}
