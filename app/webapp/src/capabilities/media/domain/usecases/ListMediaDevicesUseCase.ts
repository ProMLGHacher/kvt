import type { PromiseResult, NoInputUseCase } from '@kvt/core'
import type { MediaDevice, MediaError } from '../model'
import type { MediaDeviceRepository } from '../repository/MediaDeviceRepository'

export class ListMediaDevicesUseCase implements NoInputUseCase<
  PromiseResult<readonly MediaDevice[], MediaError>
> {
  constructor(private readonly repository: MediaDeviceRepository) {}

  execute(): PromiseResult<readonly MediaDevice[], MediaError> {
    return this.repository.listDevices()
  }
}
