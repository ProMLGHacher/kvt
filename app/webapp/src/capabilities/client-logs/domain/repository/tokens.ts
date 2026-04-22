import { createToken } from '@kvt/core'
import type { ClientLogRepository } from './ClientLogRepository'

export const clientLogRepositoryToken = createToken<ClientLogRepository>('ClientLogRepository')
