import { Inject, Module, Provides, ViewModelProvider, createModuleFromClass } from '@kvt/core'
import { ConfigureAudioProcessingUseCase } from '@capabilities/audio-processing/domain/usecases/ConfigureAudioProcessingUseCase'
import { ObserveAudioProcessingUseCase } from '@capabilities/audio-processing/domain/usecases/ObserveAudioProcessingUseCase'
import { ListMediaDevicesUseCase } from '@capabilities/media/domain/usecases/ListMediaDevicesUseCase'
import { ObserveLocalMediaUseCase } from '@capabilities/media/domain/usecases/ObserveLocalMediaUseCase'
import { SetCameraEnabledUseCase } from '@capabilities/media/domain/usecases/SetCameraEnabledUseCase'
import { SetMicrophoneEnabledUseCase } from '@capabilities/media/domain/usecases/SetMicrophoneEnabledUseCase'
import { StartLocalPreviewUseCase } from '@capabilities/media/domain/usecases/StartLocalPreviewUseCase'
import { StopLocalPreviewUseCase } from '@capabilities/media/domain/usecases/StopLocalPreviewUseCase'
import { GetUserPreferencesUseCase } from '@capabilities/user-preferences/domain/usecases/GetUserPreferencesUseCase'
import { SaveAudioProcessingSettingsUseCase } from '@capabilities/user-preferences/domain/usecases/SaveAudioProcessingSettingsUseCase'
import { SaveDefaultCameraEnabledUseCase } from '@capabilities/user-preferences/domain/usecases/SaveDefaultCameraEnabledUseCase'
import { SaveDefaultMicEnabledUseCase } from '@capabilities/user-preferences/domain/usecases/SaveDefaultMicEnabledUseCase'
import { SaveDisplayNameUseCase } from '@capabilities/user-preferences/domain/usecases/SaveDisplayNameUseCase'
import { SavePreferredCameraUseCase } from '@capabilities/user-preferences/domain/usecases/SavePreferredCameraUseCase'
import { SavePreferredMicrophoneUseCase } from '@capabilities/user-preferences/domain/usecases/SavePreferredMicrophoneUseCase'
import { SettingsViewModel } from './presentation/view_model/SettingsViewModel'

@Module({ name: 'SettingsModule' })
class SettingsModule {
  @Provides(SettingsViewModel)
  @ViewModelProvider()
  static provideSettingsViewModel(
    @Inject(GetUserPreferencesUseCase) getPreferences: GetUserPreferencesUseCase,
    @Inject(ListMediaDevicesUseCase) listDevices: ListMediaDevicesUseCase,
    @Inject(ObserveLocalMediaUseCase) observeMedia: ObserveLocalMediaUseCase,
    @Inject(StartLocalPreviewUseCase) startPreview: StartLocalPreviewUseCase,
    @Inject(StopLocalPreviewUseCase) stopPreview: StopLocalPreviewUseCase,
    @Inject(SetMicrophoneEnabledUseCase) setMicrophoneEnabled: SetMicrophoneEnabledUseCase,
    @Inject(SetCameraEnabledUseCase) setCameraEnabled: SetCameraEnabledUseCase,
    @Inject(ConfigureAudioProcessingUseCase)
    configureAudioProcessing: ConfigureAudioProcessingUseCase,
    @Inject(ObserveAudioProcessingUseCase) observeAudioProcessing: ObserveAudioProcessingUseCase,
    @Inject(SaveDisplayNameUseCase) saveDisplayName: SaveDisplayNameUseCase,
    @Inject(SaveAudioProcessingSettingsUseCase)
    saveAudioProcessing: SaveAudioProcessingSettingsUseCase,
    @Inject(SaveDefaultMicEnabledUseCase) saveDefaultMic: SaveDefaultMicEnabledUseCase,
    @Inject(SaveDefaultCameraEnabledUseCase) saveDefaultCamera: SaveDefaultCameraEnabledUseCase,
    @Inject(SavePreferredMicrophoneUseCase) saveMicrophone: SavePreferredMicrophoneUseCase,
    @Inject(SavePreferredCameraUseCase) saveCamera: SavePreferredCameraUseCase
  ) {
    return new SettingsViewModel(
      getPreferences,
      listDevices,
      observeMedia,
      startPreview,
      stopPreview,
      setMicrophoneEnabled,
      setCameraEnabled,
      configureAudioProcessing,
      observeAudioProcessing,
      saveDisplayName,
      saveAudioProcessing,
      saveDefaultMic,
      saveDefaultCamera,
      saveMicrophone,
      saveCamera
    )
  }
}

export const settingsModule = createModuleFromClass(SettingsModule)
export default settingsModule
