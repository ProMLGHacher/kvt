import { CompositeDisposable, MutableSharedFlow, MutableStateFlow, ViewModel } from '@kvt/core'
import {
  createDefaultAudioPlugin,
  normalizePluginChain,
  type AudioPluginConfig,
  type AudioPluginInstance,
  type AudioPluginKind,
  type AudioProcessingSettings
} from '@capabilities/audio-processing/domain/model'
import type { ConfigureAudioProcessingUseCase } from '@capabilities/audio-processing/domain/usecases/ConfigureAudioProcessingUseCase'
import type { ObserveAudioProcessingUseCase } from '@capabilities/audio-processing/domain/usecases/ObserveAudioProcessingUseCase'
import type { MediaError } from '@capabilities/media/domain/model'
import type { GetUserPreferencesUseCase } from '@capabilities/user-preferences/domain/usecases/GetUserPreferencesUseCase'
import type { SaveAudioProcessingSettingsUseCase } from '@capabilities/user-preferences/domain/usecases/SaveAudioProcessingSettingsUseCase'
import type { SaveDefaultCameraEnabledUseCase } from '@capabilities/user-preferences/domain/usecases/SaveDefaultCameraEnabledUseCase'
import type { SaveDefaultMicEnabledUseCase } from '@capabilities/user-preferences/domain/usecases/SaveDefaultMicEnabledUseCase'
import type { SaveDisplayNameUseCase } from '@capabilities/user-preferences/domain/usecases/SaveDisplayNameUseCase'
import type { SavePreferredCameraUseCase } from '@capabilities/user-preferences/domain/usecases/SavePreferredCameraUseCase'
import type { SavePreferredMicrophoneUseCase } from '@capabilities/user-preferences/domain/usecases/SavePreferredMicrophoneUseCase'
import type { ListMediaDevicesUseCase } from '@capabilities/media/domain/usecases/ListMediaDevicesUseCase'
import type { ObserveLocalMediaUseCase } from '@capabilities/media/domain/usecases/ObserveLocalMediaUseCase'
import type { StartLocalPreviewUseCase } from '@capabilities/media/domain/usecases/StartLocalPreviewUseCase'
import type { StopLocalPreviewUseCase } from '@capabilities/media/domain/usecases/StopLocalPreviewUseCase'
import {
  applyUserSettings,
  initialSettingsState,
  type SettingsTab,
  type SettingsErrorMessageKey,
  type SettingsUiAction,
  type SettingsUiEffect,
  type SettingsUiState
} from '../model/SettingsState'

export class SettingsViewModel extends ViewModel {
  private readonly state = new MutableStateFlow<SettingsUiState>(initialSettingsState)
  private readonly effects = new MutableSharedFlow<SettingsUiEffect>()

  private previewRequestId = 0

  readonly uiState = this.state.asStateFlow()
  readonly uiEffect = this.effects.asSharedFlow()

  constructor(
    private readonly getUserPreferencesUseCase: GetUserPreferencesUseCase,
    private readonly listMediaDevicesUseCase: ListMediaDevicesUseCase,
    private readonly observeLocalMediaUseCase: ObserveLocalMediaUseCase,
    private readonly startLocalPreviewUseCase: StartLocalPreviewUseCase,
    private readonly stopLocalPreviewUseCase: StopLocalPreviewUseCase,
    private readonly configureAudioProcessingUseCase: ConfigureAudioProcessingUseCase,
    private readonly observeAudioProcessingUseCase: ObserveAudioProcessingUseCase,
    private readonly saveDisplayNameUseCase: SaveDisplayNameUseCase,
    private readonly saveAudioProcessingSettingsUseCase: SaveAudioProcessingSettingsUseCase,
    private readonly saveDefaultMicEnabledUseCase: SaveDefaultMicEnabledUseCase,
    private readonly saveDefaultCameraEnabledUseCase: SaveDefaultCameraEnabledUseCase,
    private readonly savePreferredMicrophoneUseCase: SavePreferredMicrophoneUseCase,
    private readonly savePreferredCameraUseCase: SavePreferredCameraUseCase
  ) {
    super()
  }

  protected override onInit() {
    const disposables = new CompositeDisposable()

    disposables.add(
      this.observeLocalMediaUseCase.execute().subscribe((media) => {
        this.updateState((state) => ({
          ...state,
          preview: media.preview
        }))
      })
    )

    disposables.add(
      this.observeAudioProcessingUseCase.execute().subscribe((audioProcessing) => {
        this.updateState((state) => ({
          ...state,
          audioProcessing: audioProcessing.settings,
          audioMeter: audioProcessing.meter
        }))
      })
    )

    return disposables
  }

  onEvent(event: SettingsUiAction) {
    switch (event.type) {
      case 'opened':
        void this.open()
        break
      case 'closed':
        this.close()
        break
      case 'tab-selected':
        void this.selectTab(event.tab)
        break
      case 'display-name-changed':
        this.updateDisplayName(event.value)
        break
      case 'microphone-toggled':
        void this.updateMicrophone(event.enabled)
        break
      case 'camera-toggled':
        void this.updateCamera(event.enabled)
        break
      case 'microphone-selected':
        void this.selectMicrophone(event.deviceId)
        break
      case 'camera-selected':
        void this.selectCamera(event.deviceId)
        break
      case 'audio-monitor-toggled':
        void this.updateAudioProcessing({
          ...this.state.value.audioProcessing,
          monitorEnabled: event.enabled
        })
        break
      case 'audio-plugin-added':
        void this.addAudioPlugin(event.kind)
        break
      case 'audio-plugin-removed':
        void this.removeAudioPlugin(event.pluginId)
        break
      case 'audio-plugin-moved':
        void this.moveAudioPlugin(event.pluginId, event.direction)
        break
      case 'audio-plugin-dropped':
        void this.dropAudioPlugin(event.pluginId, event.targetPluginId)
        break
      case 'audio-plugin-enabled-changed':
        void this.setAudioPluginEnabled(event.pluginId, event.enabled)
        break
      case 'audio-plugin-config-changed':
        void this.updateAudioPluginConfig(event.pluginId, event.config)
        break
      default:
        throw new Error(`Unknown event: ${JSON.stringify(event)}`)
    }
  }

  private async open() {
    this.updateState((state) => ({
      ...state,
      isOpen: true,
      loading: true,
      error: null
    }))

    const [preferences, devices] = await Promise.all([
      this.getUserPreferencesUseCase.execute(),
      this.listMediaDevicesUseCase.execute()
    ])

    this.updateState((state) => ({
      ...applyUserSettings(state, preferences),
      devices: devices.ok ? devices.value : [],
      loading: false,
      error: devices.ok ? null : settingsMediaErrorMessage(devices.error)
    }))
    this.configureAudioProcessingUseCase.execute(preferences.audioProcessing)

    if (!devices.ok) {
      this.effects.emit({ type: 'show-error', message: settingsMediaErrorMessage(devices.error) })
    }
  }

  private close() {
    this.previewRequestId++
    this.stopLocalPreviewUseCase.execute()
    this.updateState((state) => ({
      ...state,
      isOpen: false,
      activeTab: 'profile',
      preview: null
    }))
  }

  private async selectTab(tab: SettingsTab) {
    this.updateState((state) => ({ ...state, activeTab: tab }))

    if ((tab === 'media' || tab === 'audio') && this.state.value.isOpen) {
      await this.startPreview(tab)
      return
    }

    this.previewRequestId++
    this.stopLocalPreviewUseCase.execute()
  }

  private updateDisplayName(value: string) {
    this.updateState((state) => ({ ...state, displayName: value }))
    this.saveDisplayNameUseCase.execute(value.trim())
  }

  private async updateMicrophone(enabled: boolean) {
    this.updateState((state) => ({ ...state, micEnabled: enabled }))
    this.saveDefaultMicEnabledUseCase.execute(enabled)

    if (this.isPreviewTabActive()) {
      // Toggle пересобирает preview из selected*Id во ViewModel.
      // Для "По умолчанию" это важно: в media-state может жить старый exact deviceId.
      await this.startPreview()
    }
  }

  private async updateCamera(enabled: boolean) {
    this.updateState((state) => ({ ...state, cameraEnabled: enabled }))
    this.saveDefaultCameraEnabledUseCase.execute(enabled)

    if (this.isPreviewTabActive()) {
      // Toggle пересобирает preview из selected*Id во ViewModel.
      // Для "По умолчанию" это важно: в media-state может жить старый exact deviceId.
      await this.startPreview()
    }
  }

  private async selectMicrophone(deviceId: string | null) {
    this.updateState((state) => ({ ...state, selectedMicrophoneId: deviceId }))
    this.savePreferredMicrophoneUseCase.execute(deviceId)
    if (this.isPreviewTabActive()) {
      await this.startPreview()
    }
  }

  private async selectCamera(deviceId: string | null) {
    this.updateState((state) => ({ ...state, selectedCameraId: deviceId }))
    this.savePreferredCameraUseCase.execute(deviceId)
    if (this.isPreviewTabActive()) {
      await this.startPreview()
    }
  }

  private async addAudioPlugin(kind: AudioPluginKind) {
    await this.updateAudioProcessing({
      ...this.state.value.audioProcessing,
      chain: [...this.state.value.audioProcessing.chain, createDefaultAudioPlugin(kind)]
    })
  }

  private async removeAudioPlugin(pluginId: string) {
    await this.updateAudioProcessing({
      ...this.state.value.audioProcessing,
      chain: this.state.value.audioProcessing.chain.filter(
        (plugin) => plugin.id !== pluginId || plugin.locked
      )
    })
  }

  private async moveAudioPlugin(pluginId: string, direction: 'up' | 'down') {
    const chain = [...this.state.value.audioProcessing.chain]
    const index = chain.findIndex((plugin) => plugin.id === pluginId)
    const targetIndex = direction === 'up' ? index - 1 : index + 1

    if (index <= 0 || targetIndex <= 0 || targetIndex >= chain.length) {
      return
    }

    const [plugin] = chain.splice(index, 1)
    chain.splice(targetIndex, 0, plugin)
    await this.updateAudioProcessing({
      ...this.state.value.audioProcessing,
      chain
    })
  }

  private async dropAudioPlugin(pluginId: string, targetPluginId: string) {
    if (pluginId === targetPluginId) {
      return
    }

    const chain = [...this.state.value.audioProcessing.chain]
    const index = chain.findIndex((plugin) => plugin.id === pluginId)
    const targetIndex = chain.findIndex((plugin) => plugin.id === targetPluginId)

    if (index <= 0 || targetIndex <= 0) {
      return
    }

    const [plugin] = chain.splice(index, 1)
    chain.splice(targetIndex, 0, plugin)
    await this.updateAudioProcessing({
      ...this.state.value.audioProcessing,
      chain
    })
  }

  private async setAudioPluginEnabled(pluginId: string, enabled: boolean) {
    await this.patchAudioPlugin(pluginId, (plugin) =>
      plugin.kind === 'volume' ? plugin : ({ ...plugin, enabled } as AudioPluginInstance)
    )
  }

  private async updateAudioPluginConfig(pluginId: string, config: Partial<AudioPluginConfig>) {
    await this.patchAudioPlugin(pluginId, (plugin) => patchPluginConfig(plugin, config))
  }

  private async patchAudioPlugin(
    pluginId: string,
    patcher: (plugin: AudioPluginInstance) => AudioPluginInstance
  ) {
    await this.updateAudioProcessing({
      ...this.state.value.audioProcessing,
      chain: this.state.value.audioProcessing.chain.map((plugin) =>
        plugin.id === pluginId ? patcher(plugin) : plugin
      )
    })
  }

  private async updateAudioProcessing(settings: AudioProcessingSettings) {
    const normalizedSettings = {
      ...settings,
      chain: normalizePluginChain(settings.chain)
    }

    this.updateState((state) => ({
      ...state,
      audioProcessing: normalizedSettings
    }))
    this.configureAudioProcessingUseCase.execute(normalizedSettings)
    this.saveAudioProcessingSettingsUseCase.execute(normalizedSettings)

    if (this.isPreviewTabActive()) {
      await this.startPreview()
    }
  }

  private async startPreview(tab = this.state.value.activeTab) {
    const requestId = ++this.previewRequestId
    const state = this.state.value

    // Preview стартует только на media/audio вкладках, иначе settings незаметно забирает устройства.
    if (!state.isOpen || (tab !== 'media' && tab !== 'audio')) {
      return
    }

    const result = await this.startLocalPreviewUseCase.execute({
      micEnabled: tab === 'audio' ? true : state.micEnabled,
      cameraEnabled: tab === 'media' ? state.cameraEnabled : false,
      microphoneDeviceId: state.selectedMicrophoneId,
      cameraDeviceId: state.selectedCameraId,
      audioProcessing: state.audioProcessing
    })

    if (requestId !== this.previewRequestId) {
      return
    }

    if (result.ok) {
      await this.refreshDevices()
      return
    }

    this.handleMediaError(result.error)
  }

  private async refreshDevices() {
    const devices = await this.listMediaDevicesUseCase.execute()
    if (!devices.ok) {
      return
    }

    this.updateState((state) => ({
      ...state,
      devices: devices.value
    }))
  }

  private handleMediaError(error: MediaError) {
    const message = settingsMediaErrorMessage(error)
    this.updateState((state) => ({
      ...state,
      error: message
    }))
    this.effects.emit({ type: 'show-error', message })
  }

  private updateState(updater: (state: SettingsUiState) => SettingsUiState) {
    this.state.update(updater)
  }

  private isPreviewTabActive(): boolean {
    return (
      this.state.value.isOpen &&
      (this.state.value.activeTab === 'media' || this.state.value.activeTab === 'audio')
    )
  }
}

function settingsMediaErrorMessage(error: MediaError): SettingsErrorMessageKey {
  switch (error.type) {
    case 'permission-denied':
      return 'settings.errors.permissionDenied'
    case 'device-not-found':
      return 'settings.errors.deviceNotFound'
    case 'device-busy':
      return 'settings.errors.deviceBusy'
    case 'insecure-context':
      return 'settings.errors.insecureContext'
    case 'api-unavailable':
      return 'settings.errors.apiUnavailable'
    case 'unknown-error':
      return 'settings.errors.preview'
  }
}

export type { SettingsTab }

function patchPluginConfig(
  plugin: AudioPluginInstance,
  config: Partial<AudioPluginConfig>
): AudioPluginInstance {
  switch (plugin.kind) {
    case 'volume':
      return { ...plugin, config: { ...plugin.config, ...config } } as AudioPluginInstance
    case 'noiseGate':
      return { ...plugin, config: { ...plugin.config, ...config } } as AudioPluginInstance
    case 'compressor':
      return { ...plugin, config: { ...plugin.config, ...config } } as AudioPluginInstance
    case 'equalizer10':
      return { ...plugin, config: { ...plugin.config, ...config } } as AudioPluginInstance
    case 'saturator':
      return { ...plugin, config: { ...plugin.config, ...config } } as AudioPluginInstance
  }
}
