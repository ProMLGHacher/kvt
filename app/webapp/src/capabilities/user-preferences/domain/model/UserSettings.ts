import type { AudioProcessingSettings } from '@capabilities/audio-processing/domain/model'

export type UserSettings = {
  displayName: string | null
  preferredMicrophoneId: string | null
  preferredCameraId: string | null
  defaultMicEnabled: boolean
  defaultCameraEnabled: boolean
  defaultNoiseSuppressionEnabled: boolean
  audioProcessing: AudioProcessingSettings
}
