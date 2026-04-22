import type { PromiseResult } from '@kvt/core'
import type { ClipboardWriteError, ClipboardWriteParams } from '../model/Clipboard'

export interface ClipboardRepository {
  writeText(params: ClipboardWriteParams): PromiseResult<void, ClipboardWriteError>
}
