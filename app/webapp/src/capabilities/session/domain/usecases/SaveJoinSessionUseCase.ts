import type { PromiseResult, UseCase } from '@kvt/core'
import type { JoinSession, SessionError } from '../model/JoinSession'
import type { JoinSessionRepository } from '../repository/JoinSessionRepository'

export class SaveJoinSessionUseCase implements UseCase<
  JoinSession,
  PromiseResult<void, SessionError>
> {
  constructor(private readonly repository: JoinSessionRepository) {}

  execute(session: JoinSession): PromiseResult<void, SessionError> {
    return this.repository.save(session)
  }
}
