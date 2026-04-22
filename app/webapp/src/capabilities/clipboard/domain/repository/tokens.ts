import { createToken } from '@kvt/core'
import type { ClipboardRepository } from './ClipboardRepository'

export const clipboardRepositoryToken = createToken<ClipboardRepository>('ClipboardRepository')
