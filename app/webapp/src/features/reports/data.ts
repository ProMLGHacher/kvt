import type { ReportSummary, ReportsRepository } from './domain'

export class DemoReportsRepository implements ReportsRepository {
  loadSummary(): ReportSummary {
    return {
      title: 'report.summary',
      generatedAt: new Intl.DateTimeFormat('en', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(new Date()),
      score: 94
    }
  }
}
