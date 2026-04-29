import { Inject, Module, Provides, Singleton, createModuleFromClass } from '@kvt/core'
import { BrowserLocalPreviewRepository } from './data/repository/BrowserLocalPreviewRepository'
import { BrowserMediaDeviceRepository } from './data/repository/BrowserMediaDeviceRepository'
import { BrowserScreenShareRepository } from './data/repository/BrowserScreenShareRepository'
import { LocalMediaStateStore } from './data/repository/LocalMediaStateStore'
import {
  localPreviewRepositoryToken,
  mediaDeviceRepositoryToken,
  screenShareRepositoryToken
} from './domain/repository/tokens'
import { ListMediaDevicesUseCase } from './domain/usecases/ListMediaDevicesUseCase'
import { ObserveLocalMediaUseCase } from './domain/usecases/ObserveLocalMediaUseCase'
import { SetCameraEnabledUseCase } from './domain/usecases/SetCameraEnabledUseCase'
import { SetMicrophoneEnabledUseCase } from './domain/usecases/SetMicrophoneEnabledUseCase'
import { SetNoiseSuppressionUseCase } from './domain/usecases/SetNoiseSuppressionUseCase'
import { SetScreenShareEnabledUseCase } from './domain/usecases/SetScreenShareEnabledUseCase'
import { StartLocalPreviewUseCase } from './domain/usecases/StartLocalPreviewUseCase'
import { StopLocalPreviewUseCase } from './domain/usecases/StopLocalPreviewUseCase'
import type { LocalPreviewRepository } from './domain/repository/LocalPreviewRepository'
import type { MediaDeviceRepository } from './domain/repository/MediaDeviceRepository'
import type { ScreenShareRepository } from './domain/repository/ScreenShareRepository'

@Module({ name: 'MediaModule' })
class MediaModule {
  @Provides(mediaDeviceRepositoryToken)
  @Singleton({ lazy: true })
  static provideMediaDeviceRepository(): MediaDeviceRepository {
    return new BrowserMediaDeviceRepository()
  }

  @Provides(LocalMediaStateStore)
  @Singleton({ lazy: true })
  static provideLocalMediaStateStore(): LocalMediaStateStore {
    return new LocalMediaStateStore()
  }

  @Provides(localPreviewRepositoryToken)
  @Singleton({ lazy: true })
  static provideLocalPreviewRepository(
    @Inject(LocalMediaStateStore) stateStore: LocalMediaStateStore
  ): LocalPreviewRepository {
    return new BrowserLocalPreviewRepository(stateStore)
  }

  @Provides(screenShareRepositoryToken)
  @Singleton({ lazy: true })
  static provideScreenShareRepository(
    @Inject(LocalMediaStateStore) stateStore: LocalMediaStateStore
  ): ScreenShareRepository {
    return new BrowserScreenShareRepository(stateStore)
  }

  @Provides(ListMediaDevicesUseCase)
  static provideListMediaDevicesUseCase(
    @Inject(mediaDeviceRepositoryToken) repository: MediaDeviceRepository
  ) {
    return new ListMediaDevicesUseCase(repository)
  }

  @Provides(ObserveLocalMediaUseCase)
  static provideObserveLocalMediaUseCase(
    @Inject(localPreviewRepositoryToken) repository: LocalPreviewRepository
  ) {
    return new ObserveLocalMediaUseCase(repository)
  }

  @Provides(SetCameraEnabledUseCase)
  static provideSetCameraEnabledUseCase(
    @Inject(localPreviewRepositoryToken) repository: LocalPreviewRepository
  ) {
    return new SetCameraEnabledUseCase(repository)
  }

  @Provides(SetMicrophoneEnabledUseCase)
  static provideSetMicrophoneEnabledUseCase(
    @Inject(localPreviewRepositoryToken) repository: LocalPreviewRepository
  ) {
    return new SetMicrophoneEnabledUseCase(repository)
  }

  @Provides(SetNoiseSuppressionUseCase)
  static provideSetNoiseSuppressionUseCase(
    @Inject(localPreviewRepositoryToken) repository: LocalPreviewRepository
  ) {
    return new SetNoiseSuppressionUseCase(repository)
  }

  @Provides(SetScreenShareEnabledUseCase)
  static provideSetScreenShareEnabledUseCase(
    @Inject(screenShareRepositoryToken) repository: ScreenShareRepository
  ) {
    return new SetScreenShareEnabledUseCase(repository)
  }

  @Provides(StartLocalPreviewUseCase)
  static provideStartLocalPreviewUseCase(
    @Inject(localPreviewRepositoryToken) repository: LocalPreviewRepository
  ) {
    return new StartLocalPreviewUseCase(repository)
  }

  @Provides(StopLocalPreviewUseCase)
  static provideStopLocalPreviewUseCase(
    @Inject(localPreviewRepositoryToken) repository: LocalPreviewRepository
  ) {
    return new StopLocalPreviewUseCase(repository)
  }
}

export const mediaModule = createModuleFromClass(MediaModule)
export default mediaModule
