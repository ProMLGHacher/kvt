import { Inject, Module, Provides, Singleton, createModuleFromClass } from '@kvt/core'
import { BrowserAudioProcessingRepository } from './data/repository/BrowserAudioProcessingRepository'
import { audioProcessingRepositoryToken } from './domain/repository/tokens'
import { ConfigureAudioProcessingUseCase } from './domain/usecases/ConfigureAudioProcessingUseCase'
import { ObserveAudioProcessingUseCase } from './domain/usecases/ObserveAudioProcessingUseCase'
import type { AudioProcessingRepository } from './domain/repository/AudioProcessingRepository'

@Module({ name: 'AudioProcessingModule' })
class AudioProcessingModule {
  @Provides(audioProcessingRepositoryToken)
  @Singleton({ lazy: true })
  static provideAudioProcessingRepository(): AudioProcessingRepository {
    return new BrowserAudioProcessingRepository()
  }

  @Provides(ConfigureAudioProcessingUseCase)
  static provideConfigureAudioProcessingUseCase(
    @Inject(audioProcessingRepositoryToken) repository: AudioProcessingRepository
  ) {
    return new ConfigureAudioProcessingUseCase(repository)
  }

  @Provides(ObserveAudioProcessingUseCase)
  static provideObserveAudioProcessingUseCase(
    @Inject(audioProcessingRepositoryToken) repository: AudioProcessingRepository
  ) {
    return new ObserveAudioProcessingUseCase(repository)
  }
}

export const audioProcessingModule = createModuleFromClass(AudioProcessingModule)
export default audioProcessingModule
