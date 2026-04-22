import type { NoInputUseCase } from '@kvt/core'
import type { LocalMediaRepository } from '../repository/LocalMediaRepository'

export class StopLocalPreviewUseCase implements NoInputUseCase<void> {
  constructor(private readonly repository: LocalMediaRepository) {}

  execute(): void {
    this.repository.stopPreview()
  }
}
