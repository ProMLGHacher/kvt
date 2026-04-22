import type { MediaDevice, LocalPreviewState } from '@capabilities/media/domain/model'
import type { RoomMetadata } from '@features/room/domain/model/Room'
import type { UserSettings } from '@capabilities/user-preferences/domain/model/UserSettings'
import type { ParticipantRole } from '@features/room/domain/model/Participant'

export type LoadPrejoinContextParams = {
  readonly roomId: string
  readonly requestedRole: ParticipantRole
}

export type PrejoinContext = {
  readonly room: RoomMetadata
  readonly preferences: UserSettings
  readonly devices: readonly MediaDevice[]
  readonly requestedRole: ParticipantRole
}

export type LoadPrejoinContextError =
  | { readonly type: 'room-not-found' }
  | { readonly type: 'media-unavailable' }
  | { readonly type: 'unknown-error' }

export type PrejoinMediaPreferences = {
  readonly displayName: string
  readonly micEnabled: boolean
  readonly cameraEnabled: boolean
  readonly microphoneDeviceId: string | null
  readonly cameraDeviceId: string | null
  readonly noiseSuppressionEnabled: boolean
}

export type PrejoinPreview = LocalPreviewState
