import type { PromiseResult, UseCase } from '@kvt/core'
import type { RtcError } from '../model'
import type { RtcRepository } from '../repository/RtcRepository'

export class SetRtcScreenShareEnabledUseCase implements UseCase<
  boolean,
  PromiseResult<void, RtcError>
> {
  constructor(private readonly repository: RtcRepository) {}

  execute(enabled: boolean): PromiseResult<void, RtcError> {
    return this.repository.setScreenShareEnabled(enabled)
  }
}
