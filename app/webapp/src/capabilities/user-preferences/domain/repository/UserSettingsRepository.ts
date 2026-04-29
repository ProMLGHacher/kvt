import type { UserSettings } from '../model/UserSettings'
import type { AudioProcessingSettings } from '@capabilities/audio-processing/domain/model'

export interface UserSettingsRepository {
  getPreferences(): Promise<UserSettings>

  saveDisplayName(displayName: string): Promise<void>
  savePreferredMicrophoneId(deviceId: string | null): Promise<void>
  savePreferredCameraId(deviceId: string | null): Promise<void>
  saveDefaultMicEnabled(enabled: boolean): Promise<void>
  saveDefaultCameraEnabled(enabled: boolean): Promise<void>
  saveDefaultNoiseSuppressionEnabled(enabled: boolean): Promise<void>
  saveAudioProcessing(settings: AudioProcessingSettings): Promise<void>
}
