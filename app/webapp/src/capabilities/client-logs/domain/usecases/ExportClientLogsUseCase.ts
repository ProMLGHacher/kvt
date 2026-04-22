import type { NoInputUseCase } from '@kvt/core'
import type { ClientLogExport } from '../model/ClientLog'
import type { ClientLogRepository } from '../repository/ClientLogRepository'

export class ExportClientLogsUseCase implements NoInputUseCase<ClientLogExport> {
  constructor(private readonly repository: ClientLogRepository) {}

  execute(): ClientLogExport {
    const content = this.repository
      .getEntries()
      .map((entry) => JSON.stringify(entry))
      .join('\n')

    return {
      fileName: 'client-logs.txt',
      content
    }
  }
}
