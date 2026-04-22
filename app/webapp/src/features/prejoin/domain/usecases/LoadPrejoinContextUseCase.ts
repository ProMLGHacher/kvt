import { err, ok, type PromiseResult, type UseCase } from '@kvt/core'
import { GetRoomMetadataUseCase } from '@features/room/domain/usecases/GetRoomMetadataUseCase'
import { ListMediaDevicesUseCase } from '@capabilities/media/domain/usecases/ListMediaDevicesUseCase'
import { GetUserPreferencesUseCase } from '@capabilities/user-preferences/domain/usecases/GetUserPreferencesUseCase'
import type {
  LoadPrejoinContextError,
  LoadPrejoinContextParams,
  PrejoinContext
} from '../model/PrejoinContext'

export class LoadPrejoinContextUseCase implements UseCase<
  LoadPrejoinContextParams,
  PromiseResult<PrejoinContext, LoadPrejoinContextError>
> {
  constructor(
    private readonly getRoomMetadataUseCase: GetRoomMetadataUseCase,
    private readonly listMediaDevicesUseCase: ListMediaDevicesUseCase,
    private readonly getUserPreferencesUseCase: GetUserPreferencesUseCase
  ) {}

  async execute(
    params: LoadPrejoinContextParams
  ): PromiseResult<PrejoinContext, LoadPrejoinContextError> {
    const room = await this.getRoomMetadataUseCase.execute({ roomId: params.roomId })
    if (!room.ok) {
      return err(
        room.error.type === 'room-not-found'
          ? { type: 'room-not-found' }
          : { type: 'unknown-error' }
      )
    }

    const devices = await this.listMediaDevicesUseCase.execute()
    if (!devices.ok) {
      return err({ type: 'media-unavailable' })
    }

    return ok({
      room: room.value,
      devices: devices.value,
      preferences: await this.getUserPreferencesUseCase.execute(),
      requestedRole: params.requestedRole
    })
  }
}
