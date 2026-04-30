import { createToken } from '@kvt/core'
import type { ChatRepository } from './ChatRepository'

export const chatRepositoryToken = createToken<ChatRepository>('ChatRepository')
