import {
  createDefaultAudioProcessingSettings,
  normalizeAudioProcessingSettings,
  type AudioProcessingSettings
} from '@capabilities/audio-processing/domain/model'
import type { UserSettings } from '@capabilities/user-preferences/domain/model/UserSettings'
import type { UserSettingsRepository } from '@capabilities/user-preferences/domain/repository/UserSettingsRepository'

const storageKey = 'kvatum.user-preferences'
const legacyStorageKey = 'kvt.rooms.user-preferences'

const defaultSettings: UserSettings = {
  displayName: null,
  preferredMicrophoneId: null,
  preferredCameraId: null,
  defaultMicEnabled: true,
  defaultCameraEnabled: false,
  defaultNoiseSuppressionEnabled: true,
  audioProcessing: createDefaultAudioProcessingSettings()
}

export class LocalStorageUserSettingsRepository implements UserSettingsRepository {
  async getPreferences(): Promise<UserSettings> {
    return this.read()
  }

  async saveDisplayName(displayName: string): Promise<void> {
    this.write({ ...this.read(), displayName })
  }

  async savePreferredMicrophoneId(deviceId: string | null): Promise<void> {
    this.write({ ...this.read(), preferredMicrophoneId: deviceId })
  }

  async savePreferredCameraId(deviceId: string | null): Promise<void> {
    this.write({ ...this.read(), preferredCameraId: deviceId })
  }

  async saveDefaultMicEnabled(enabled: boolean): Promise<void> {
    this.write({ ...this.read(), defaultMicEnabled: enabled })
  }

  async saveDefaultCameraEnabled(enabled: boolean): Promise<void> {
    this.write({ ...this.read(), defaultCameraEnabled: enabled })
  }

  async saveDefaultNoiseSuppressionEnabled(enabled: boolean): Promise<void> {
    this.write({ ...this.read(), defaultNoiseSuppressionEnabled: enabled })
  }

  async saveAudioProcessing(settings: AudioProcessingSettings): Promise<void> {
    this.write({ ...this.read(), audioProcessing: normalizeAudioProcessingSettings(settings) })
  }

  private read(): UserSettings {
    const stored = localStorage.getItem(storageKey) ?? localStorage.getItem(legacyStorageKey)
    if (!stored) {
      return defaultSettings
    }

    try {
      const parsed = JSON.parse(stored)
      return {
        ...defaultSettings,
        ...parsed,
        audioProcessing: normalizeAudioProcessingSettings(parsed.audioProcessing)
      }
    } catch {
      return defaultSettings
    }
  }

  private write(settings: UserSettings) {
    localStorage.setItem(storageKey, JSON.stringify(settings))
  }
}
