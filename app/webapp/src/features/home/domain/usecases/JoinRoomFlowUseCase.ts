import { err, ok, type PromiseResult, type UseCase } from '@kvt/core'
import type {
  JoinRoomFlowError,
  JoinRoomFlowParams,
  JoinRoomFlowResult
} from '../model/JoinRoomFlow'
import type { RoomExistsByIdUseCase } from '@features/room/domain/usecases/RoomExistsByIdUseCase'
import { ValidateRoomIdInputUseCase } from './ValidateRoomIdInputUseCase'

export class JoinRoomFlowUseCase implements UseCase<
  JoinRoomFlowParams,
  PromiseResult<JoinRoomFlowResult, JoinRoomFlowError>
> {
  constructor(
    private readonly validateRoomIdInputUseCase: ValidateRoomIdInputUseCase,
    private readonly checkRoomExistsUseCase: RoomExistsByIdUseCase
  ) {}

  async execute(params: JoinRoomFlowParams): PromiseResult<JoinRoomFlowResult, JoinRoomFlowError> {
    const validation = this.validateRoomIdInputUseCase.execute({ value: params.idOrLink })
    if (!validation.valid) {
      return err({ type: 'room-not-found' })
    }

    const roomExists = await this.checkRoomExistsUseCase.execute({ roomId: validation.roomId })
    if (roomExists.ok) {
      if (roomExists.value.exists) {
        return ok({ roomId: validation.roomId })
      } else {
        return err({ type: 'room-not-found' })
      }
    } else {
      return err({ type: 'unknown-error' })
    }
  }
}
