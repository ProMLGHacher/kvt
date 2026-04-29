import type { LocalPreviewState, MediaDevice } from '@capabilities/media/domain/model'
import type { UserSettings } from '@capabilities/user-preferences/domain/model/UserSettings'
import type { PrefixedTranslationKey } from '@core/i18n/translation-key'
import {
  createDefaultAudioProcessingSettings,
  type AudioPluginConfig,
  type AudioPluginKind,
  type AudioProcessingMeter,
  type AudioProcessingSettings
} from '@capabilities/audio-processing/domain/model'

export type SettingsTab = 'profile' | 'media' | 'audio' | 'appearance'
export type SettingsErrorMessageKey = PrefixedTranslationKey<'common', 'settings.errors'>

export type SettingsUiState = {
  readonly isOpen: boolean
  readonly activeTab: SettingsTab
  readonly loading: boolean
  readonly devices: readonly MediaDevice[]
  readonly displayName: string
  readonly micEnabled: boolean
  readonly cameraEnabled: boolean
  readonly selectedMicrophoneId: string | null
  readonly selectedCameraId: string | null
  readonly preview: LocalPreviewState | null
  readonly audioProcessing: AudioProcessingSettings
  readonly audioMeter: AudioProcessingMeter
  readonly error: SettingsErrorMessageKey | null
}

export type SettingsUiAction =
  | { readonly type: 'opened' }
  | { readonly type: 'closed' }
  | { readonly type: 'tab-selected'; readonly tab: SettingsTab }
  | { readonly type: 'display-name-changed'; readonly value: string }
  | { readonly type: 'microphone-toggled'; readonly enabled: boolean }
  | { readonly type: 'camera-toggled'; readonly enabled: boolean }
  | { readonly type: 'microphone-selected'; readonly deviceId: string | null }
  | { readonly type: 'camera-selected'; readonly deviceId: string | null }
  | { readonly type: 'audio-monitor-toggled'; readonly enabled: boolean }
  | { readonly type: 'audio-plugin-added'; readonly kind: AudioPluginKind }
  | { readonly type: 'audio-plugin-removed'; readonly pluginId: string }
  | {
      readonly type: 'audio-plugin-moved'
      readonly pluginId: string
      readonly direction: 'up' | 'down'
    }
  | {
      readonly type: 'audio-plugin-dropped'
      readonly pluginId: string
      readonly targetPluginId: string
    }
  | {
      readonly type: 'audio-plugin-enabled-changed'
      readonly pluginId: string
      readonly enabled: boolean
    }
  | {
      readonly type: 'audio-plugin-config-changed'
      readonly pluginId: string
      readonly config: Partial<AudioPluginConfig>
    }

export type SettingsUiEffect = {
  readonly type: 'show-error'
  readonly message: SettingsErrorMessageKey
}

export const initialSettingsState: SettingsUiState = {
  isOpen: false,
  activeTab: 'profile',
  loading: false,
  devices: [],
  displayName: '',
  micEnabled: true,
  cameraEnabled: false,
  selectedMicrophoneId: null,
  selectedCameraId: null,
  preview: null,
  audioProcessing: createDefaultAudioProcessingSettings(),
  audioMeter: {
    levelDb: -90,
    spectrum: Array.from({ length: 24 }, () => 0)
  },
  error: null
}

export function applyUserSettings(state: SettingsUiState, settings: UserSettings): SettingsUiState {
  return {
    ...state,
    displayName: settings.displayName ?? '',
    micEnabled: settings.defaultMicEnabled,
    cameraEnabled: settings.defaultCameraEnabled,
    selectedMicrophoneId: settings.preferredMicrophoneId,
    selectedCameraId: settings.preferredCameraId,
    audioProcessing: settings.audioProcessing
  }
}
