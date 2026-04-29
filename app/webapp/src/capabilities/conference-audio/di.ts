import { Inject, Module, Provides, Singleton, createModuleFromClass } from '@kvt/core'
import { BrowserConferenceAudioRepository } from './data/repository/BrowserConferenceAudioRepository'
import { conferenceAudioRepositoryToken } from './domain/repository/tokens'
import { PlayConferenceSoundUseCase } from './domain/usecases/PlayConferenceSoundUseCase'
import type { ConferenceAudioRepository } from './domain/repository/ConferenceAudioRepository'

@Module({ name: 'ConferenceAudioModule' })
class ConferenceAudioModule {
  @Provides(conferenceAudioRepositoryToken)
  @Singleton({ lazy: true })
  static provideConferenceAudioRepository(): ConferenceAudioRepository {
    return new BrowserConferenceAudioRepository()
  }

  @Provides(PlayConferenceSoundUseCase)
  static providePlayConferenceSoundUseCase(
    @Inject(conferenceAudioRepositoryToken) repository: ConferenceAudioRepository
  ) {
    return new PlayConferenceSoundUseCase(repository)
  }
}

export const conferenceAudioModule = createModuleFromClass(ConferenceAudioModule)
export default conferenceAudioModule
