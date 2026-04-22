export type IceTransportMode = 'all' | 'relay'

export type PeerRecoveryAction = 'none' | 'restart' | 'fallback-relay'

export interface PeerHealthSnapshot {
  hasSelectedCandidatePair: boolean
  totalBytes: number
  hadSuccessfulTransport: boolean
}

export interface PeerRecoveryDecisionInput {
  transportMode: IceTransportMode
  iceConnectionState: string
  health: PeerHealthSnapshot
}

export const PEER_CHECKING_TIMEOUT_MS = 12_000
export const PEER_RECOVERY_COOLDOWN_MS = 8_000

export function decidePeerRecoveryAction({
  transportMode,
  iceConnectionState,
  health
}: PeerRecoveryDecisionInput): PeerRecoveryAction {
  if (transportMode === 'all') {
    if (iceConnectionState === 'failed') {
      return 'fallback-relay'
    }

    if (iceConnectionState === 'disconnected') {
      if (
        health.hadSuccessfulTransport ||
        health.hasSelectedCandidatePair ||
        health.totalBytes > 0
      ) {
        return 'restart'
      }
      return 'fallback-relay'
    }

    if (
      iceConnectionState === 'checking' &&
      !health.hasSelectedCandidatePair &&
      health.totalBytes === 0
    ) {
      return 'fallback-relay'
    }

    return 'none'
  }

  if (iceConnectionState === 'failed' || iceConnectionState === 'disconnected') {
    return 'restart'
  }

  if (
    iceConnectionState === 'checking' &&
    !health.hasSelectedCandidatePair &&
    health.totalBytes === 0
  ) {
    return 'restart'
  }

  return 'none'
}
