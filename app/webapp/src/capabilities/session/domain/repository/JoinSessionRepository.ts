import type { PromiseResult } from '@kvt/core'
import type { JoinSession, SessionError, StoredJoinSession } from '../model/JoinSession'

export interface JoinSessionRepository {
  save(session: JoinSession): PromiseResult<void, SessionError>
  load(roomId: string): PromiseResult<StoredJoinSession, SessionError>
  clear(roomId: string): PromiseResult<void, SessionError>
}
