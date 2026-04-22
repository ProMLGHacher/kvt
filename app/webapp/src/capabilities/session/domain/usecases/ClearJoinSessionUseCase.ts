import type { PromiseResult, UseCase } from '@kvt/core'
import type { SessionError } from '../model/JoinSession'
import type { JoinSessionRepository } from '../repository/JoinSessionRepository'

export class ClearJoinSessionUseCase implements UseCase<string, PromiseResult<void, SessionError>> {
  constructor(private readonly repository: JoinSessionRepository) {}

  execute(roomId: string): PromiseResult<void, SessionError> {
    return this.repository.clear(roomId)
  }
}
