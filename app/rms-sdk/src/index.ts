import { ConferenceClient } from './conference-client'

export {
  ConferenceClient,
  type ConferenceDiagnostics,
  type ConferenceEvents,
  type PeerDiagnostics,
  type StartOptions
} from './conference-client'
export { setRmsLogSink, type RmsLogLevel, type RmsLogSink } from './logger'
export type {
  CandidatePayload,
  ErrorPayload,
  HeartbeatPayload,
  ICEServerConfig,
  IceRestartPayload,
  ParticipantRole,
  ParticipantState,
  RoomSnapshot,
  RoomSnapshotPayload,
  SessionDescriptionPayload,
  SignalEnvelope,
  SignalPeer,
  SlotKind,
  SlotState,
  SlotUpdatedPayload
} from './protocol'

export type KvatumRealtimeClient = ConferenceClient

export function createKvatumRealtimeClient(
  ...args: ConstructorParameters<typeof ConferenceClient>
): ConferenceClient {
  return new ConferenceClient(...args)
}
