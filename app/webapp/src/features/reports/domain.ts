import { createToken, type NoInputUseCase } from '@kvt/core'

export interface ReportSummary {
  readonly title: string
  readonly generatedAt: string
  readonly score: number
}

export interface ReportsRepository {
  loadSummary(): ReportSummary
}

export const reportsRepositoryToken = createToken<ReportsRepository>('ReportsRepository')

export class LoadReportSummaryUseCase implements NoInputUseCase<ReportSummary> {
  private readonly repository: ReportsRepository

  constructor(repository: ReportsRepository) {
    this.repository = repository
  }

  execute(): ReportSummary {
    return this.repository.loadSummary()
  }
}
