import type { PromiseResult, UseCase } from '@kvt/core'
import type { RtcError } from '@capabilities/rtc/domain/model'
import { SetRtcCameraEnabledUseCase } from '@capabilities/rtc/domain/usecases/SetRtcCameraEnabledUseCase'

export class ToggleRoomCameraUseCase implements UseCase<boolean, PromiseResult<void, RtcError>> {
  constructor(private readonly setRtcCameraEnabledUseCase: SetRtcCameraEnabledUseCase) {}

  execute(enabled: boolean): PromiseResult<void, RtcError> {
    return this.setRtcCameraEnabledUseCase.execute(enabled)
  }
}
