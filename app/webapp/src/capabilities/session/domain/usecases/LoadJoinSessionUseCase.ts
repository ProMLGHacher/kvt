import type { PromiseResult, UseCase } from '@kvt/core'
import type { SessionError, StoredJoinSession } from '../model/JoinSession'
import type { JoinSessionRepository } from '../repository/JoinSessionRepository'

export class LoadJoinSessionUseCase implements UseCase<
  string,
  PromiseResult<StoredJoinSession, SessionError>
> {
  constructor(private readonly repository: JoinSessionRepository) {}

  execute(roomId: string): PromiseResult<StoredJoinSession, SessionError> {
    return this.repository.load(roomId)
  }
}
