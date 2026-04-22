import type { NoInputUseCase } from '@kvt/core'
import type { ClientLogRepository } from '../repository/ClientLogRepository'

export class ClearClientLogsUseCase implements NoInputUseCase<void> {
  constructor(private readonly repository: ClientLogRepository) {}

  execute(): void {
    this.repository.clear()
  }
}
