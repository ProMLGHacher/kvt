import type { PromiseResult, UseCase } from '@kvt/core'
import type { ClipboardWriteError, ClipboardWriteParams } from '../model/Clipboard'
import type { ClipboardRepository } from '../repository/ClipboardRepository'

export class CopyTextUseCase implements UseCase<
  ClipboardWriteParams,
  PromiseResult<void, ClipboardWriteError>
> {
  constructor(private readonly clipboardRepository: ClipboardRepository) {}

  execute(params: ClipboardWriteParams): PromiseResult<void, ClipboardWriteError> {
    return this.clipboardRepository.writeText(params)
  }
}
