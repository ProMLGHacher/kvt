import { err, ok, type PromiseResult, type UseCase } from '@kvt/core'
import type { CopyTextUseCase } from '@capabilities/clipboard/domain/usecases/CopyTextUseCase'
import type { CopyRoomLinkError, CopyRoomLinkParams, CopyRoomLinkResult } from '../model/RoomLink'
import type { BuildRoomLinkUseCase } from './BuildRoomLinkUseCase'

export class CopyRoomLinkUseCase implements UseCase<
  CopyRoomLinkParams,
  PromiseResult<CopyRoomLinkResult, CopyRoomLinkError>
> {
  constructor(
    private readonly buildRoomLinkUseCase: BuildRoomLinkUseCase,
    private readonly copyTextUseCase: CopyTextUseCase
  ) {}

  async execute(params: CopyRoomLinkParams): PromiseResult<CopyRoomLinkResult, CopyRoomLinkError> {
    const result = this.buildRoomLinkUseCase.execute(params)
    const copied = await this.copyTextUseCase.execute({ text: result.link })

    if (copied.ok) {
      return ok(result)
    }

    if (copied.error.type === 'clipboard-unavailable') {
      return err({ type: 'clipboard-unavailable' })
    }

    return err({ type: 'unknown-error' })
  }
}
