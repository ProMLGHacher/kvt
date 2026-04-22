import type { PromiseResult, UseCase } from '@kvt/core'
import type { ConnectRtcParams, RtcError } from '../model'
import type { RtcRepository } from '../repository/RtcRepository'

export class ConnectToRoomRtcUseCase implements UseCase<
  ConnectRtcParams,
  PromiseResult<void, RtcError>
> {
  constructor(private readonly repository: RtcRepository) {}

  execute(params: ConnectRtcParams): PromiseResult<void, RtcError> {
    return this.repository.connect(params)
  }
}
