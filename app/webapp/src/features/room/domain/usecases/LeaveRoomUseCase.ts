import type { NoInputUseCase } from '@kvt/core'
import { DisconnectRtcUseCase } from '@capabilities/rtc/domain/usecases/DisconnectRtcUseCase'
import { StopLocalPreviewUseCase } from '@capabilities/media/domain/usecases/StopLocalPreviewUseCase'
import type { LeaveRoomResult } from '../model/RoomControls'

export class LeaveRoomUseCase implements NoInputUseCase<LeaveRoomResult> {
  constructor(
    private readonly disconnectRtcUseCase: DisconnectRtcUseCase,
    private readonly stopLocalPreviewUseCase: StopLocalPreviewUseCase
  ) {}

  execute(): LeaveRoomResult {
    this.disconnectRtcUseCase.execute()
    this.stopLocalPreviewUseCase.execute()
    return { shouldNavigateHome: true }
  }
}
