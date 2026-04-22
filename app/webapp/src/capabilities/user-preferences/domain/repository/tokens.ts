import { createToken } from '@kvt/core'
import type { UserSettingsRepository } from './UserSettingsRepository'

export const userSettingsRepositoryToken =
  createToken<UserSettingsRepository>('UserSettingsRepository')
