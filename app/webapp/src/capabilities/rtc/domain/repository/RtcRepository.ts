import type { PromiseResult, StateFlow } from '@kvt/core'
import type { ConnectRtcParams, RtcDiagnostics, RtcError, RtcSession } from '../model'

export interface RtcRepository {
  readonly session: StateFlow<RtcSession>
  readonly diagnostics: StateFlow<RtcDiagnostics | null>
  connect(params: ConnectRtcParams): PromiseResult<void, RtcError>
  disconnect(): void
  setMicrophoneEnabled(enabled: boolean): PromiseResult<void, RtcError>
  setCameraEnabled(enabled: boolean): PromiseResult<void, RtcError>
  setScreenShareEnabled(enabled: boolean): PromiseResult<void, RtcError>
  restartIce(): PromiseResult<void, RtcError>
  forceRelayTransport(): PromiseResult<void, RtcError>
}
