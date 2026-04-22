import type { NoInputUseCase, PromiseResult } from '@kvt/core'
import type { RtcError } from '../model'
import type { RtcRepository } from '../repository/RtcRepository'

export class RestartIceUseCase implements NoInputUseCase<PromiseResult<void, RtcError>> {
  constructor(private readonly repository: RtcRepository) {}

  execute(): PromiseResult<void, RtcError> {
    return this.repository.restartIce()
  }
}
