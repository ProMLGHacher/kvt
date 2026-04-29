import { Inject, Module, Provides, Singleton, createModuleFromClass } from '@kvt/core'
import { BrowserVoiceActivityRepository } from './data/repository/BrowserVoiceActivityRepository'
import { voiceActivityRepositoryToken } from './domain/repository/tokens'
import { ObserveVoiceActivityUseCase } from './domain/usecases/ObserveVoiceActivityUseCase'
import { StopVoiceActivityUseCase } from './domain/usecases/StopVoiceActivityUseCase'
import { UpdateVoiceActivitySourcesUseCase } from './domain/usecases/UpdateVoiceActivitySourcesUseCase'
import type { VoiceActivityRepository } from './domain/repository/VoiceActivityRepository'

@Module({ name: 'VoiceActivityModule' })
class VoiceActivityModule {
  @Provides(voiceActivityRepositoryToken)
  @Singleton({ lazy: true })
  static provideVoiceActivityRepository(): VoiceActivityRepository {
    return new BrowserVoiceActivityRepository()
  }

  @Provides(ObserveVoiceActivityUseCase)
  static provideObserveVoiceActivityUseCase(
    @Inject(voiceActivityRepositoryToken) repository: VoiceActivityRepository
  ) {
    return new ObserveVoiceActivityUseCase(repository)
  }

  @Provides(StopVoiceActivityUseCase)
  static provideStopVoiceActivityUseCase(
    @Inject(voiceActivityRepositoryToken) repository: VoiceActivityRepository
  ) {
    return new StopVoiceActivityUseCase(repository)
  }

  @Provides(UpdateVoiceActivitySourcesUseCase)
  static provideUpdateVoiceActivitySourcesUseCase(
    @Inject(voiceActivityRepositoryToken) repository: VoiceActivityRepository
  ) {
    return new UpdateVoiceActivitySourcesUseCase(repository)
  }
}

export const voiceActivityModule = createModuleFromClass(VoiceActivityModule)
export default voiceActivityModule
