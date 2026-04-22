import type { ButtonState } from '@core/utils/ButtonState'
import type { FormFieldStateWithShowError } from '@core/utils/FormFieldState'
import type { MediaDevice, LocalPreviewState } from '@capabilities/media/domain/model'
import type { ParticipantRole } from '@features/room/domain/model/Participant'

export type PrejoinUiState = {
  readonly roomId: string
  readonly loading: boolean
  readonly role: ParticipantRole
  readonly displayName: FormFieldStateWithShowError<string>
  readonly micEnabled: boolean
  readonly cameraEnabled: boolean
  readonly selectedMicrophoneId: string | null
  readonly selectedCameraId: string | null
  readonly devices: readonly MediaDevice[]
  readonly preview: LocalPreviewState | null
  readonly joinButton: ButtonState
  readonly error: string | null
}

export type PrejoinUiAction =
  | { readonly type: 'display-name-changed'; readonly value: string }
  | { readonly type: 'microphone-toggled'; readonly enabled: boolean }
  | { readonly type: 'camera-toggled'; readonly enabled: boolean }
  | { readonly type: 'microphone-selected'; readonly deviceId: string | null }
  | { readonly type: 'camera-selected'; readonly deviceId: string | null }
  | { readonly type: 'join-pressed' }
  | { readonly type: 'room-configured'; readonly roomId: string; readonly role: ParticipantRole }

export type PrejoinUiEffect =
  | { readonly type: 'joined'; readonly roomId: string }
  | { readonly type: 'join-failed'; readonly message: string }
  | { readonly type: 'preview-failed'; readonly message: string }

export const initialPrejoinState: PrejoinUiState = {
  roomId: '',
  loading: false,
  role: 'participant',
  displayName: { value: '', error: null, showError: false },
  micEnabled: true,
  cameraEnabled: false,
  selectedMicrophoneId: null,
  selectedCameraId: null,
  devices: [
    { id: 'default-microphone', kind: 'audio-input', label: 'Default microphone' },
    { id: 'default-camera', kind: 'video-input', label: 'Default camera' }
  ],
  preview: {
    micEnabled: true,
    cameraEnabled: false,
    previewAvailable: false,
    stream: null,
    status: 'idle',
    error: null
  },
  joinButton: { enabled: false, loading: false, error: null },
  error: null
}
