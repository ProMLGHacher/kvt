export type IceTransportPolicy = 'all' | 'relay'

export type IceRecoveryAction = 'none' | 'restart' | 'fallback-relay' | 'full-rejoin'

export type IceHealthSnapshot = {
  readonly peer: 'publisher' | 'subscriber'
  readonly connectionState: string
  readonly iceConnectionState: string
  readonly transportPolicy: IceTransportPolicy
  readonly disconnectedAtMs: number | null
  readonly lastRecoveryAtMs: number | null
}

export type IceRecoveryDecision = {
  readonly action: IceRecoveryAction
  readonly reason: string
}
