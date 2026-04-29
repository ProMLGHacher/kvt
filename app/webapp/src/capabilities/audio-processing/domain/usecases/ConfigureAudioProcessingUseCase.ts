import type { UseCase } from '@kvt/core'
import type { AudioProcessingSettings } from '../model'
import type { AudioProcessingRepository } from '../repository/AudioProcessingRepository'

export class ConfigureAudioProcessingUseCase implements UseCase<AudioProcessingSettings, void> {
  constructor(private readonly repository: AudioProcessingRepository) {}

  execute(settings: AudioProcessingSettings): void {
    this.repository.configure(settings)
  }
}
