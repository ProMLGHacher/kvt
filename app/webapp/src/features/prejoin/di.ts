import { Inject, Module, Provides, ViewModelProvider, createModuleFromClass } from '@kvt/core'
import { ListMediaDevicesUseCase } from '@capabilities/media/domain/usecases/ListMediaDevicesUseCase'
import { ObserveLocalMediaUseCase } from '@capabilities/media/domain/usecases/ObserveLocalMediaUseCase'
import { SetCameraEnabledUseCase } from '@capabilities/media/domain/usecases/SetCameraEnabledUseCase'
import { SetMicrophoneEnabledUseCase } from '@capabilities/media/domain/usecases/SetMicrophoneEnabledUseCase'
import { StartLocalPreviewUseCase } from '@capabilities/media/domain/usecases/StartLocalPreviewUseCase'
import { GetUserPreferencesUseCase } from '@capabilities/user-preferences/domain/usecases/GetUserPreferencesUseCase'
import { SaveDefaultCameraEnabledUseCase } from '@capabilities/user-preferences/domain/usecases/SaveDefaultCameraEnabledUseCase'
import { SaveDefaultMicEnabledUseCase } from '@capabilities/user-preferences/domain/usecases/SaveDefaultMicEnabledUseCase'
import { SaveDisplayNameUseCase } from '@capabilities/user-preferences/domain/usecases/SaveDisplayNameUseCase'
import { SavePreferredCameraUseCase } from '@capabilities/user-preferences/domain/usecases/SavePreferredCameraUseCase'
import { SavePreferredMicrophoneUseCase } from '@capabilities/user-preferences/domain/usecases/SavePreferredMicrophoneUseCase'
import { SaveJoinSessionUseCase } from '@capabilities/session/domain/usecases/SaveJoinSessionUseCase'
import { GetRoomMetadataUseCase } from '@features/room/domain/usecases/GetRoomMetadataUseCase'
import { JoinRoomUseCase } from '@features/room/domain/usecases/JoinRoomUseCase'
import { JoinRoomFlowUseCase } from './domain/usecases/JoinRoomFlowUseCase'
import { LoadPrejoinContextUseCase } from './domain/usecases/LoadPrejoinContextUseCase'
import { StartPrejoinPreviewUseCase } from './domain/usecases/StartPrejoinPreviewUseCase'
import { PrejoinViewModel } from './presentation/view_model/PrejoinViewModel'

@Module({ name: 'PrejoinModule' })
class PrejoinModule {
  @Provides(LoadPrejoinContextUseCase)
  static provideLoadPrejoinContextUseCase(
    @Inject(GetRoomMetadataUseCase) room: GetRoomMetadataUseCase,
    @Inject(ListMediaDevicesUseCase) devices: ListMediaDevicesUseCase,
    @Inject(GetUserPreferencesUseCase) preferences: GetUserPreferencesUseCase
  ) {
    return new LoadPrejoinContextUseCase(room, devices, preferences)
  }

  @Provides(StartPrejoinPreviewUseCase)
  static provideStartPrejoinPreviewUseCase(
    @Inject(StartLocalPreviewUseCase) startPreview: StartLocalPreviewUseCase
  ) {
    return new StartPrejoinPreviewUseCase(startPreview)
  }

  @Provides(JoinRoomFlowUseCase)
  static provideJoinRoomFlowUseCase(
    @Inject(JoinRoomUseCase) joinRoom: JoinRoomUseCase,
    @Inject(SaveDisplayNameUseCase) saveName: SaveDisplayNameUseCase,
    @Inject(SaveDefaultMicEnabledUseCase) saveMic: SaveDefaultMicEnabledUseCase,
    @Inject(SaveDefaultCameraEnabledUseCase) saveCamera: SaveDefaultCameraEnabledUseCase,
    @Inject(SavePreferredMicrophoneUseCase) saveMicrophone: SavePreferredMicrophoneUseCase,
    @Inject(SavePreferredCameraUseCase) savePreferredCamera: SavePreferredCameraUseCase,
    @Inject(SaveJoinSessionUseCase) saveSession: SaveJoinSessionUseCase
  ) {
    return new JoinRoomFlowUseCase(
      joinRoom,
      saveName,
      saveMic,
      saveCamera,
      saveMicrophone,
      savePreferredCamera,
      saveSession
    )
  }

  @Provides(PrejoinViewModel)
  @ViewModelProvider()
  static providePrejoinViewModel(
    @Inject(LoadPrejoinContextUseCase) loadContext: LoadPrejoinContextUseCase,
    @Inject(StartPrejoinPreviewUseCase) startPreview: StartPrejoinPreviewUseCase,
    @Inject(ObserveLocalMediaUseCase) observeMedia: ObserveLocalMediaUseCase,
    @Inject(SetMicrophoneEnabledUseCase) setMicrophoneEnabled: SetMicrophoneEnabledUseCase,
    @Inject(SetCameraEnabledUseCase) setCameraEnabled: SetCameraEnabledUseCase,
    @Inject(JoinRoomFlowUseCase) joinRoom: JoinRoomFlowUseCase
  ) {
    return new PrejoinViewModel(
      loadContext,
      startPreview,
      observeMedia,
      setMicrophoneEnabled,
      setCameraEnabled,
      joinRoom
    )
  }
}

export const prejoinModule = createModuleFromClass(PrejoinModule)
export default prejoinModule
