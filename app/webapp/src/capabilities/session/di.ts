import { Inject, Module, Provides, Singleton, createModuleFromClass } from '@kvt/core'
import { LocalStorageJoinSessionRepository } from './data/repository/LocalStorageJoinSessionRepository'
import { joinSessionRepositoryToken } from './domain/repository/tokens'
import { ClearJoinSessionUseCase } from './domain/usecases/ClearJoinSessionUseCase'
import { LoadJoinSessionUseCase } from './domain/usecases/LoadJoinSessionUseCase'
import { SaveJoinSessionUseCase } from './domain/usecases/SaveJoinSessionUseCase'
import type { JoinSessionRepository } from './domain/repository/JoinSessionRepository'

@Module({ name: 'SessionModule' })
class SessionModule {
  @Provides(joinSessionRepositoryToken)
  @Singleton({ lazy: true })
  static provideJoinSessionRepository(): JoinSessionRepository {
    return new LocalStorageJoinSessionRepository()
  }

  @Provides(ClearJoinSessionUseCase)
  static provideClearJoinSessionUseCase(
    @Inject(joinSessionRepositoryToken) repository: JoinSessionRepository
  ) {
    return new ClearJoinSessionUseCase(repository)
  }

  @Provides(LoadJoinSessionUseCase)
  static provideLoadJoinSessionUseCase(
    @Inject(joinSessionRepositoryToken) repository: JoinSessionRepository
  ) {
    return new LoadJoinSessionUseCase(repository)
  }

  @Provides(SaveJoinSessionUseCase)
  static provideSaveJoinSessionUseCase(
    @Inject(joinSessionRepositoryToken) repository: JoinSessionRepository
  ) {
    return new SaveJoinSessionUseCase(repository)
  }
}

export const sessionModule = createModuleFromClass(SessionModule)
export default sessionModule
