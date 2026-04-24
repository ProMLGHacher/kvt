import type { NoInputUseCase, StateFlow } from '@kvt/core'
import type { RtcDiagnostics } from '@capabilities/rtc/domain/model'
import type { RtcRepository } from '@capabilities/rtc/domain/repository/RtcRepository'

export class ObserveRoomDiagnosticsUseCase implements NoInputUseCase<
  StateFlow<RtcDiagnostics | null>
> {
  constructor(private readonly rtcRepository: RtcRepository) {}

  execute(): StateFlow<RtcDiagnostics | null> {
    return this.rtcRepository.diagnostics
  }
}
