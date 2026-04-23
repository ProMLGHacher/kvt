import type { ConferenceDiagnostics } from '@features/room/presentation/model/RoomDiagnostics'
import type { RoomControlState } from '@features/room/domain/model/RoomControls'
import type { Participant } from '@features/room/domain/model/Participant'
import type { RtcConnectionStatus } from '@capabilities/rtc/domain/model'

export type RoomUiState = {
  readonly roomId: string
  readonly prejoinOpen: boolean
  readonly status: RtcConnectionStatus
  readonly participants: readonly Participant[]
  readonly localParticipantId: string | null
  readonly localStream: MediaStream | null
  readonly remoteStreams: Readonly<Record<string, MediaStream>>
  readonly microphone: RoomControlState
  readonly camera: RoomControlState
  readonly screenShare: RoomControlState
  readonly actionStatus: string
  readonly error: RoomUiError | null
  readonly diagnostics: ConferenceDiagnostics | null
  readonly technicalInfoVisible: boolean
}

export type RoomUiAction =
  | { readonly type: 'room-opened'; readonly roomId: string }
  | { readonly type: 'go-home-pressed' }
  | { readonly type: 'prejoin-completed' }
  | { readonly type: 'microphone-toggled' }
  | { readonly type: 'camera-toggled' }
  | { readonly type: 'screen-share-toggled' }
  | { readonly type: 'copy-link-pressed' }
  | { readonly type: 'export-logs-pressed' }
  | { readonly type: 'clear-logs-pressed' }
  | { readonly type: 'leave-pressed' }
  | { readonly type: 'technical-info-toggled'; readonly visible: boolean }

export type RoomUiEffect =
  | { readonly type: 'navigate-home' }
  | { readonly type: 'show-toast'; readonly message: string }
  | { readonly type: 'download-logs'; readonly fileName: string; readonly content: string }

export type RoomUiError = {
  readonly title: string
  readonly description: string
  readonly actionLabel: string
}

export const initialRoomState: RoomUiState = {
  roomId: '',
  prejoinOpen: false,
  status: 'idle',
  participants: [],
  localParticipantId: null,
  localStream: null,
  remoteStreams: {},
  microphone: { kind: 'microphone', enabled: true, loading: false, error: null },
  camera: { kind: 'camera', enabled: false, loading: false, error: null },
  screenShare: { kind: 'screen', enabled: false, loading: false, error: null },
  actionStatus: 'room.status.chooseSettings',
  error: null,
  diagnostics: null,
  technicalInfoVisible: false
}
