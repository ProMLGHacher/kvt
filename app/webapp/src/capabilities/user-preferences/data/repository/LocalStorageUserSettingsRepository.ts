import type { UserSettings } from '@capabilities/user-preferences/domain/model/UserSettings'
import type { UserSettingsRepository } from '@capabilities/user-preferences/domain/repository/UserSettingsRepository'

const storageKey = 'kvt.rooms.user-preferences'

const defaultSettings: UserSettings = {
  displayName: null,
  preferredMicrophoneId: null,
  preferredCameraId: null,
  defaultMicEnabled: true,
  defaultCameraEnabled: false,
  defaultNoiseSuppressionEnabled: true
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

  private read(): UserSettings {
    const stored = localStorage.getItem(storageKey)
    if (!stored) {
      return defaultSettings
    }

    try {
      return { ...defaultSettings, ...JSON.parse(stored) }
    } catch {
      return defaultSettings
    }
  }

  private write(settings: UserSettings) {
    localStorage.setItem(storageKey, JSON.stringify(settings))
  }
}
