import { Inject, Module, Provides, Singleton, createModuleFromClass } from '@kvt/core'
import { BrowserClipboardRepository } from './data/repository/BrowserClipboardRepository'
import { clipboardRepositoryToken } from './domain/repository/tokens'
import { CopyTextUseCase } from './domain/usecases/CopyTextUseCase'
import type { ClipboardRepository } from './domain/repository/ClipboardRepository'

@Module({ name: 'ClipboardModule' })
class ClipboardModule {
  @Provides(clipboardRepositoryToken)
  @Singleton({ lazy: true })
  static provideClipboardRepository(): ClipboardRepository {
    return new BrowserClipboardRepository()
  }

  @Provides(CopyTextUseCase)
  static provideCopyTextUseCase(@Inject(clipboardRepositoryToken) repository: ClipboardRepository) {
    return new CopyTextUseCase(repository)
  }
}

export const clipboardModule = createModuleFromClass(ClipboardModule)
export default clipboardModule
