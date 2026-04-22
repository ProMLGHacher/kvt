import type { PromiseResult, UseCase } from '@kvt/core'
import type { RtcError } from '@capabilities/rtc/domain/model'
import { SetRtcScreenShareEnabledUseCase } from '@capabilities/rtc/domain/usecases/SetRtcScreenShareEnabledUseCase'

export class ToggleRoomScreenShareUseCase implements UseCase<
  boolean,
  PromiseResult<void, RtcError>
> {
  constructor(private readonly setRtcScreenShareEnabledUseCase: SetRtcScreenShareEnabledUseCase) {}

  execute(enabled: boolean): PromiseResult<void, RtcError> {
    return this.setRtcScreenShareEnabledUseCase.execute(enabled)
  }
}
