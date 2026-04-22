import type { NoInputUseCase } from '@kvt/core'
import type { RtcRepository } from '../repository/RtcRepository'

export class DisconnectRtcUseCase implements NoInputUseCase<void> {
  constructor(private readonly repository: RtcRepository) {}

  execute(): void {
    this.repository.disconnect()
  }
}
