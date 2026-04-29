import type { UseCase } from '@kvt/core'
import type { AudioProcessingSettings } from '@capabilities/audio-processing/domain/model'
import type { UserSettingsRepository } from '../repository/UserSettingsRepository'

export class SaveAudioProcessingSettingsUseCase implements UseCase<AudioProcessingSettings, void> {
  constructor(private readonly userSettingsRepository: UserSettingsRepository) {}

  execute(settings: AudioProcessingSettings): void {
    this.userSettingsRepository.saveAudioProcessing(settings)
  }
}
