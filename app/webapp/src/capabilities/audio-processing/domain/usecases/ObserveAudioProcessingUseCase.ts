import type { NoInputUseCase, StateFlow } from '@kvt/core'
import type { AudioProcessingState } from '../model'
import type { AudioProcessingRepository } from '../repository/AudioProcessingRepository'

export class ObserveAudioProcessingUseCase implements NoInputUseCase<
  StateFlow<AudioProcessingState>
> {
  constructor(private readonly repository: AudioProcessingRepository) {}

  execute(): StateFlow<AudioProcessingState> {
    return this.repository.state
  }
}
