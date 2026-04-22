import type { Flow, PromiseResult } from '@kvt/core'
import type { RtcError, SignalingMessage } from '../model'

export interface SignalingRepository {
  readonly messages: Flow<SignalingMessage>
  connect(wsUrl: string): PromiseResult<void, RtcError>
  send(message: SignalingMessage): PromiseResult<void, RtcError>
  disconnect(): void
}
