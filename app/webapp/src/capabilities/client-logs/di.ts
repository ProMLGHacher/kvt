import { Inject, Module, Provides, Singleton, createModuleFromClass } from '@kvt/core'
import { LocalStorageClientLogRepository } from './data/repository/LocalStorageClientLogRepository'
import { clientLogRepositoryToken } from './domain/repository/tokens'
import { AppendClientLogUseCase } from './domain/usecases/AppendClientLogUseCase'
import { ClearClientLogsUseCase } from './domain/usecases/ClearClientLogsUseCase'
import { ExportClientLogsUseCase } from './domain/usecases/ExportClientLogsUseCase'
import type { ClientLogRepository } from './domain/repository/ClientLogRepository'

@Module({ name: 'ClientLogsModule' })
class ClientLogsModule {
  @Provides(clientLogRepositoryToken)
  @Singleton({ lazy: true })
  static provideClientLogRepository(): ClientLogRepository {
    return new LocalStorageClientLogRepository()
  }

  @Provides(AppendClientLogUseCase)
  static provideAppendClientLogUseCase(
    @Inject(clientLogRepositoryToken) repository: ClientLogRepository
  ) {
    return new AppendClientLogUseCase(repository)
  }

  @Provides(ClearClientLogsUseCase)
  static provideClearClientLogsUseCase(
    @Inject(clientLogRepositoryToken) repository: ClientLogRepository
  ) {
    return new ClearClientLogsUseCase(repository)
  }

  @Provides(ExportClientLogsUseCase)
  static provideExportClientLogsUseCase(
    @Inject(clientLogRepositoryToken) repository: ClientLogRepository
  ) {
    return new ExportClientLogsUseCase(repository)
  }
}

export const clientLogsModule = createModuleFromClass(ClientLogsModule)
export default clientLogsModule
