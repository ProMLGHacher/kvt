export type ClientLogLevel = 'info' | 'warn' | 'error'

export type ClientLogEntry = {
  readonly id: string
  readonly timestamp: string
  readonly level: ClientLogLevel
  readonly scope: string
  readonly message: string
  readonly data?: unknown
}

export type ClientLogExport = {
  readonly fileName: string
  readonly content: string
}
