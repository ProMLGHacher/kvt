import { createToken } from '@kvt/core'
import type { AudioProcessingRepository } from './AudioProcessingRepository'

export const audioProcessingRepositoryToken = createToken<AudioProcessingRepository>(
  'AudioProcessingRepository'
)
