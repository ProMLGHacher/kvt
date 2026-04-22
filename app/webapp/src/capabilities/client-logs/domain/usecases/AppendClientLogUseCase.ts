import type { UseCase } from '@kvt/core'
import type { ClientLogEntry } from '../model/ClientLog'
import type { ClientLogRepository } from '../repository/ClientLogRepository'

export class AppendClientLogUseCase implements UseCase<
  Omit<ClientLogEntry, 'id' | 'timestamp'>,
  void
> {
  constructor(private readonly repository: ClientLogRepository) {}

  execute(entry: Omit<ClientLogEntry, 'id' | 'timestamp'>): void {
    this.repository.append(entry)
  }
}
