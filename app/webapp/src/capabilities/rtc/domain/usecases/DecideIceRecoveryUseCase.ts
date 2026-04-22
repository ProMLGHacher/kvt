import type { UseCase } from '@kvt/core'
import type { IceHealthSnapshot, IceRecoveryDecision } from '../model'

export class DecideIceRecoveryUseCase implements UseCase<IceHealthSnapshot, IceRecoveryDecision> {
  execute(snapshot: IceHealthSnapshot): IceRecoveryDecision {
    if (snapshot.iceConnectionState === 'failed') {
      return snapshot.transportPolicy === 'relay'
        ? { action: 'restart', reason: 'relay transport failed, restart ICE first' }
        : { action: 'fallback-relay', reason: 'ICE failed before relay fallback' }
    }

    if (snapshot.iceConnectionState === 'disconnected' && snapshot.disconnectedAtMs) {
      return { action: 'restart', reason: 'ICE disconnected long enough to recover' }
    }

    return { action: 'none', reason: 'peer is healthy enough' }
  }
}
