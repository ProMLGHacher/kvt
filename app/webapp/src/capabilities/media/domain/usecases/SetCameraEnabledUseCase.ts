import type { PromiseResult, UseCase } from '@kvt/core'
import type { MediaError } from '../model'
import type { LocalMediaRepository } from '../repository/LocalMediaRepository'

export class SetCameraEnabledUseCase implements UseCase<boolean, PromiseResult<void, MediaError>> {
  constructor(private readonly repository: LocalMediaRepository) {}

  execute(enabled: boolean): PromiseResult<void, MediaError> {
    return this.repository.setCameraEnabled(enabled)
  }
}
