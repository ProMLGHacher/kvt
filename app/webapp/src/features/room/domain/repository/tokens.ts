import { createToken } from '@kvt/core'
import type { RoomRepository } from './RoomRepository'

export const roomRepositoryToken = createToken<RoomRepository>('RoomRepository')
