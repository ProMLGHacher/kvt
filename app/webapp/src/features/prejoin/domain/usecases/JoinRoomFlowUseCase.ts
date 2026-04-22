import { err, ok, type PromiseResult, type UseCase } from '@kvt/core'
import { JoinRoomUseCase } from '@features/room/domain/usecases/JoinRoomUseCase'
import { SaveDisplayNameUseCase } from '@capabilities/user-preferences/domain/usecases/SaveDisplayNameUseCase'
import { SaveDefaultMicEnabledUseCase } from '@capabilities/user-preferences/domain/usecases/SaveDefaultMicEnabledUseCase'
import { SaveDefaultCameraEnabledUseCase } from '@capabilities/user-preferences/domain/usecases/SaveDefaultCameraEnabledUseCase'
import { SavePreferredMicrophoneUseCase } from '@capabilities/user-preferences/domain/usecases/SavePreferredMicrophoneUseCase'
import { SavePreferredCameraUseCase } from '@capabilities/user-preferences/domain/usecases/SavePreferredCameraUseCase'
import { SaveJoinSessionUseCase } from '@capabilities/session/domain/usecases/SaveJoinSessionUseCase'
import type {
  JoinRoomFlowError,
  JoinRoomFlowParams,
  JoinRoomFlowResult
} from '../model/JoinRoomFlow'

export class JoinRoomFlowUseCase implements UseCase<
  JoinRoomFlowParams,
  PromiseResult<JoinRoomFlowResult, JoinRoomFlowError>
> {
  constructor(
    private readonly joinRoomUseCase: JoinRoomUseCase,
    private readonly saveDisplayNameUseCase: SaveDisplayNameUseCase,
    private readonly saveDefaultMicEnabledUseCase: SaveDefaultMicEnabledUseCase,
    private readonly saveDefaultCameraEnabledUseCase: SaveDefaultCameraEnabledUseCase,
    private readonly savePreferredMicrophoneUseCase: SavePreferredMicrophoneUseCase,
    private readonly savePreferredCameraUseCase: SavePreferredCameraUseCase,
    private readonly saveJoinSessionUseCase: SaveJoinSessionUseCase
  ) {}

  async execute(params: JoinRoomFlowParams): PromiseResult<JoinRoomFlowResult, JoinRoomFlowError> {
    const displayName = params.displayName.trim()
    if (!displayName) {
      return err({ type: 'display-name-empty' })
    }

    const session = await this.joinRoomUseCase.execute({
      roomId: params.roomId,
      displayName,
      cameraEnabled: params.cameraEnabled,
      micEnabled: params.micEnabled,
      role: params.role
    })

    if (!session.ok) {
      return err(
        session.error.type === 'room-not-found'
          ? { type: 'room-not-found' }
          : { type: 'join-failed' }
      )
    }

    this.saveDisplayNameUseCase.execute(displayName)
    this.saveDefaultMicEnabledUseCase.execute(params.micEnabled)
    this.saveDefaultCameraEnabledUseCase.execute(params.cameraEnabled)
    this.savePreferredMicrophoneUseCase.execute(params.microphoneDeviceId)
    this.savePreferredCameraUseCase.execute(params.cameraDeviceId)
    await this.saveJoinSessionUseCase.execute(session.value)

    return ok({ session: session.value })
  }
}
