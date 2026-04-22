import type { PromiseResult, UseCase } from '@kvt/core'
import type { MediaError } from '@capabilities/media/domain/model'
import { StartLocalPreviewUseCase } from '@capabilities/media/domain/usecases/StartLocalPreviewUseCase'
import type { PrejoinMediaPreferences } from '../model/PrejoinContext'

export class StartPrejoinPreviewUseCase implements UseCase<
  PrejoinMediaPreferences,
  PromiseResult<void, MediaError>
> {
  constructor(private readonly startLocalPreviewUseCase: StartLocalPreviewUseCase) {}

  execute(preferences: PrejoinMediaPreferences): PromiseResult<void, MediaError> {
    return this.startLocalPreviewUseCase.execute({
      micEnabled: preferences.micEnabled,
      cameraEnabled: preferences.cameraEnabled,
      microphoneDeviceId: preferences.microphoneDeviceId,
      cameraDeviceId: preferences.cameraDeviceId
    })
  }
}
