import type { AudioProcessingSettings } from '@capabilities/audio-processing/domain/model'

export type RtcIceServer = {
  readonly credential?: string
  readonly urls: readonly string[]
  readonly username?: string
}

export type ConnectRtcParams = {
  readonly roomId: string
  readonly participantId: string
  readonly wsUrl: string
  readonly iceServers: readonly RtcIceServer[]
  readonly micEnabled: boolean
  readonly cameraEnabled: boolean
  readonly microphoneDeviceId?: string | null
  readonly audioProcessing?: AudioProcessingSettings
}

export type RtcError =
  | { readonly type: 'signaling-failed'; readonly message?: string }
  | { readonly type: 'publisher-failed'; readonly message?: string }
  | { readonly type: 'subscriber-failed'; readonly message?: string }
  | { readonly type: 'ice-failed'; readonly message?: string }
  | { readonly type: 'media-publish-failed'; readonly message?: string }
  | { readonly type: 'unknown-error'; readonly message?: string }
