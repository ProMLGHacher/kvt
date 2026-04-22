import type { PromiseResult, UseCase } from '@kvt/core'
import type { RtcError } from '@capabilities/rtc/domain/model'
import { SetRtcMicrophoneEnabledUseCase } from '@capabilities/rtc/domain/usecases/SetRtcMicrophoneEnabledUseCase'

export class ToggleRoomMicrophoneUseCase implements UseCase<
  boolean,
  PromiseResult<void, RtcError>
> {
  constructor(private readonly setRtcMicrophoneEnabledUseCase: SetRtcMicrophoneEnabledUseCase) {}

  execute(enabled: boolean): PromiseResult<void, RtcError> {
    return this.setRtcMicrophoneEnabledUseCase.execute(enabled)
  }
}
