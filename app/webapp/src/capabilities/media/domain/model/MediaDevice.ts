export type MediaDeviceKind = 'audio-input' | 'video-input' | 'audio-output'

export type MediaDeviceId = string

export type MediaDevice = {
  readonly id: MediaDeviceId
  readonly label: string
  readonly kind: MediaDeviceKind
  readonly groupId?: string
}

export type MediaPermissionState = 'unknown' | 'prompt' | 'granted' | 'denied' | 'unavailable'
