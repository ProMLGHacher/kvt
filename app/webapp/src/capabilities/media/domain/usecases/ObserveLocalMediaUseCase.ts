import type { NoInputUseCase, StateFlow } from '@kvt/core'
import type { LocalMediaState } from '../model'
import type { LocalMediaRepository } from '../repository/LocalMediaRepository'

export class ObserveLocalMediaUseCase implements NoInputUseCase<StateFlow<LocalMediaState>> {
  constructor(private readonly repository: LocalMediaRepository) {}

  execute(): StateFlow<LocalMediaState> {
    return this.repository.state
  }
}
