import type { NoInputUseCase, StateFlow } from '@kvt/core'
import type { RtcSession } from '@capabilities/rtc/domain/model'
import type { RtcRepository } from '@capabilities/rtc/domain/repository/RtcRepository'

export class ObserveRoomSessionUseCase implements NoInputUseCase<StateFlow<RtcSession>> {
  constructor(private readonly rtcRepository: RtcRepository) {}

  execute(): StateFlow<RtcSession> {
    return this.rtcRepository.session
  }
}
