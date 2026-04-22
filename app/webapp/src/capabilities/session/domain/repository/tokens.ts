import { createToken } from '@kvt/core'
import type { JoinSessionRepository } from './JoinSessionRepository'

export const joinSessionRepositoryToken =
  createToken<JoinSessionRepository>('JoinSessionRepository')
