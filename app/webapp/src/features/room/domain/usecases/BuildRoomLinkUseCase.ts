import type { UseCase } from '@kvt/core'
import type { CopyRoomLinkParams, CopyRoomLinkResult } from '../model/RoomLink'

export class BuildRoomLinkUseCase implements UseCase<CopyRoomLinkParams, CopyRoomLinkResult> {
  execute(params: CopyRoomLinkParams): CopyRoomLinkResult {
    return {
      link: `${params.origin.replace(/\/$/, '')}/rooms/${params.roomId}`
    }
  }
}
