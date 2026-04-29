import { Inject, Module, Provides, Singleton, createModuleFromClass } from '@kvt/core'
import { audioProcessingRepositoryToken } from '@capabilities/audio-processing/domain/repository/tokens'
import type { AudioProcessingRepository } from '@capabilities/audio-processing/domain/repository/AudioProcessingRepository'
import { BrowserRtcRepository } from './data/repository/BrowserRtcRepository'
import { BrowserSignalingRepository } from './data/repository/BrowserSignalingRepository'
import { rtcRepositoryToken, signalingRepositoryToken } from './domain/repository/tokens'
import { ConnectToRoomRtcUseCase } from './domain/usecases/ConnectToRoomRtcUseCase'
import { DecideIceRecoveryUseCase } from './domain/usecases/DecideIceRecoveryUseCase'
import { DisconnectRtcUseCase } from './domain/usecases/DisconnectRtcUseCase'
import { RestartIceUseCase } from './domain/usecases/RestartIceUseCase'
import { SetRtcCameraEnabledUseCase } from './domain/usecases/SetRtcCameraEnabledUseCase'
import { SetRtcMicrophoneEnabledUseCase } from './domain/usecases/SetRtcMicrophoneEnabledUseCase'
import { SetRtcScreenShareEnabledUseCase } from './domain/usecases/SetRtcScreenShareEnabledUseCase'
import type { RtcRepository } from './domain/repository/RtcRepository'
import type { SignalingRepository } from './domain/repository/SignalingRepository'

@Module({ name: 'RtcModule' })
class RtcModule {
  @Provides(rtcRepositoryToken)
  @Singleton({ lazy: true })
  static provideRtcRepository(
    @Inject(audioProcessingRepositoryToken) audioProcessing: AudioProcessingRepository
  ): RtcRepository {
    return new BrowserRtcRepository(audioProcessing)
  }

  @Provides(signalingRepositoryToken)
  @Singleton({ lazy: true })
  static provideSignalingRepository(): SignalingRepository {
    return new BrowserSignalingRepository()
  }

  @Provides(ConnectToRoomRtcUseCase)
  static provideConnectToRoomRtcUseCase(@Inject(rtcRepositoryToken) repository: RtcRepository) {
    return new ConnectToRoomRtcUseCase(repository)
  }

  @Provides(DecideIceRecoveryUseCase)
  static provideDecideIceRecoveryUseCase() {
    return new DecideIceRecoveryUseCase()
  }

  @Provides(DisconnectRtcUseCase)
  static provideDisconnectRtcUseCase(@Inject(rtcRepositoryToken) repository: RtcRepository) {
    return new DisconnectRtcUseCase(repository)
  }

  @Provides(RestartIceUseCase)
  static provideRestartIceUseCase(@Inject(rtcRepositoryToken) repository: RtcRepository) {
    return new RestartIceUseCase(repository)
  }

  @Provides(SetRtcCameraEnabledUseCase)
  static provideSetRtcCameraEnabledUseCase(@Inject(rtcRepositoryToken) repository: RtcRepository) {
    return new SetRtcCameraEnabledUseCase(repository)
  }

  @Provides(SetRtcMicrophoneEnabledUseCase)
  static provideSetRtcMicrophoneEnabledUseCase(
    @Inject(rtcRepositoryToken) repository: RtcRepository
  ) {
    return new SetRtcMicrophoneEnabledUseCase(repository)
  }

  @Provides(SetRtcScreenShareEnabledUseCase)
  static provideSetRtcScreenShareEnabledUseCase(
    @Inject(rtcRepositoryToken) repository: RtcRepository
  ) {
    return new SetRtcScreenShareEnabledUseCase(repository)
  }
}

export const rtcModule = createModuleFromClass(RtcModule)
export default rtcModule
