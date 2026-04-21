import { Inject, Module, Provides, Singleton, ViewModelProvider, createModuleFromClass } from '@kvt/core'
import { DemoReportsRepository } from './data'
import { LoadReportSummaryUseCase, reportsRepositoryToken, type ReportsRepository } from './domain'
import { ReportsViewModel } from './presentation'

/**
 * This module is intentionally not installed at app startup.
 *
 * The reports route loads it through `useInstallModule`, so both the React code
 * and DI registrations stay outside the main bundle until the page is opened.
 */
@Module({ name: 'ReportsModule' })
class ReportsModule {
  @Provides(reportsRepositoryToken)
  @Singleton()
  static provideReportsRepository(): ReportsRepository {
    return new DemoReportsRepository()
  }

  @Provides(LoadReportSummaryUseCase)
  static provideLoadReportSummaryUseCase(
    @Inject(reportsRepositoryToken) repository: ReportsRepository
  ): LoadReportSummaryUseCase {
    return new LoadReportSummaryUseCase(repository)
  }

  @Provides(ReportsViewModel)
  @ViewModelProvider()
  static provideReportsViewModel(@Inject(LoadReportSummaryUseCase) loadSummary: LoadReportSummaryUseCase) {
    return new ReportsViewModel(loadSummary)
  }
}

export const reportsModule = createModuleFromClass(ReportsModule)

export default reportsModule
