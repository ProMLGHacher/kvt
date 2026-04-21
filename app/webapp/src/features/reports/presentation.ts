import { MutableStateFlow, ViewModel, type StateFlow } from '@kvt/core'
import type { LoadReportSummaryUseCase, ReportSummary } from './domain'

export interface ReportsUiState {
  readonly summary: ReportSummary | null
  readonly loadedByIntent: boolean
}

export class ReportsViewModel extends ViewModel {
  private readonly mutableUiState = new MutableStateFlow<ReportsUiState>({
    summary: null,
    loadedByIntent: false
  })

  readonly uiState: StateFlow<ReportsUiState> = this.mutableUiState.asStateFlow()
  private readonly loadSummary: LoadReportSummaryUseCase

  constructor(loadSummary: LoadReportSummaryUseCase) {
    super()
    this.loadSummary = loadSummary
  }

  load(): void {
    this.mutableUiState.set({
      summary: this.loadSummary.execute(),
      loadedByIntent: true
    })
  }
}
