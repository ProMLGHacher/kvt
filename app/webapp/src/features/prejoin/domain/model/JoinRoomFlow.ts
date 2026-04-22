import type { ParticipantRole } from '@features/room/domain/model/Participant'
import type { JoinRoomResult } from '@features/room/domain/model/JoinRoom'

export type JoinRoomFlowParams = {
  readonly roomId: string
  readonly displayName: string
  readonly micEnabled: boolean
  readonly cameraEnabled: boolean
  readonly microphoneDeviceId: string | null
  readonly cameraDeviceId: string | null
  readonly role: ParticipantRole
}

export type JoinRoomFlowResult = {
  readonly session: JoinRoomResult
}

export type JoinRoomFlowError =
  | { readonly type: 'display-name-empty' }
  | { readonly type: 'room-not-found' }
  | { readonly type: 'join-failed' }
  | { readonly type: 'preferences-save-failed' }
  | { readonly type: 'unknown-error' }
