import type { UseCase } from '@kvt/core'
import type { LocalMediaRepository } from '../repository/LocalMediaRepository'

export class SetNoiseSuppressionUseCase implements UseCase<boolean, void> {
  constructor(private readonly repository: LocalMediaRepository) {}

  execute(enabled: boolean): void {
    this.repository.setNoiseSuppressionEnabled(enabled)
  }
}
