import type { PromiseResult, UseCase } from '@kvt/core'
import type { MediaError } from '../model'
import type {
  LocalMediaRepository,
  StartLocalPreviewParams
} from '../repository/LocalMediaRepository'

export class StartLocalPreviewUseCase implements UseCase<
  StartLocalPreviewParams,
  PromiseResult<void, MediaError>
> {
  constructor(private readonly repository: LocalMediaRepository) {}

  execute(params: StartLocalPreviewParams): PromiseResult<void, MediaError> {
    return this.repository.startPreview(params)
  }
}
