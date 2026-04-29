import { MutableSharedFlow, MutableStateFlow, ViewModel } from '@kvt/core'
import {
  initialPrejoinState,
  type PrejoinUiAction,
  type PrejoinUiEffect,
  type PrejoinUiState,
  type PrejoinErrorMessageKey
} from '../model/PrejoinState'
import type { JoinRoomFlowUseCase } from '@features/prejoin/domain/usecases/JoinRoomFlowUseCase'
import type { LoadPrejoinContextUseCase } from '@features/prejoin/domain/usecases/LoadPrejoinContextUseCase'
import type { StartPrejoinPreviewUseCase } from '@features/prejoin/domain/usecases/StartPrejoinPreviewUseCase'
import type { ObserveLocalMediaUseCase } from '@capabilities/media/domain/usecases/ObserveLocalMediaUseCase'
import type { SetMicrophoneEnabledUseCase } from '@capabilities/media/domain/usecases/SetMicrophoneEnabledUseCase'
import type { SetCameraEnabledUseCase } from '@capabilities/media/domain/usecases/SetCameraEnabledUseCase'

type PrejoinContextError = 'room-not-found' | 'media-unavailable' | 'unknown-error'

type MediaError =
  | 'permission-denied'
  | 'device-not-found'
  | 'device-busy'
  | 'insecure-context'
  | 'api-unavailable'
  | 'unknown-error'

type PrejoinJoinError =
  | 'display-name-empty'
  | 'room-not-found'
  | 'join-failed'
  | 'preferences-save-failed'
  | 'unknown-error'

export class PrejoinViewModel extends ViewModel {
  private readonly state = new MutableStateFlow<PrejoinUiState>(initialPrejoinState)
  private readonly effects = new MutableSharedFlow<PrejoinUiEffect>()

  // Нужны, чтобы старый async-ответ не перезаписал новое состояние.
  private configureRoomRequestId = 0
  private startPreviewRequestId = 0
  private microphoneRequestId = 0
  private cameraRequestId = 0

  // Храним отдельно, потому что в UiState нет отдельного флага загрузки preview.
  private previewStarting = false

  readonly uiState = this.state.asStateFlow()
  readonly uiEffect = this.effects.asSharedFlow()

  constructor(
    private readonly loadPrejoinContextUseCase: LoadPrejoinContextUseCase,
    private readonly startPrejoinPreviewUseCase: StartPrejoinPreviewUseCase,
    private readonly observeLocalMediaUseCase: ObserveLocalMediaUseCase,
    private readonly setMicrophoneEnabledUseCase: SetMicrophoneEnabledUseCase,
    private readonly setCameraEnabledUseCase: SetCameraEnabledUseCase,
    private readonly joinRoomFlowUseCase: JoinRoomFlowUseCase
  ) {
    super()
  }

  protected override onInit() {
    return this.observeLocalMediaUseCase.execute().subscribe((media) => {
      this.updateState((state) => ({
        ...state,
        preview: media.preview
      }))
    })
  }

  onEvent(event: PrejoinUiAction) {
    switch (event.type) {
      case 'room-configured':
        void this.configureRoom(event.roomId, event.role)
        break
      case 'display-name-changed':
        this.updateDisplayName(event.value)
        break
      case 'microphone-toggled':
        void this.updateMicrophone(event.enabled)
        break
      case 'camera-toggled':
        void this.updateCamera(event.enabled)
        break
      case 'microphone-selected':
        void this.selectMicrophone(event.deviceId)
        break
      case 'camera-selected':
        void this.selectCamera(event.deviceId)
        break
      case 'join-pressed':
        void this.join()
        break
      default:
        throw new Error(`Unknown event: ${JSON.stringify(event)}`)
    }
  }

  private async configureRoom(roomId: string, role: PrejoinUiState['role']) {
    if (this.state.value.roomId === roomId && this.state.value.role === role) {
      return
    }

    const requestId = ++this.configureRoomRequestId

    this.updateState((state) => ({
      ...state,
      roomId,
      role,
      loading: true,
      error: null
    }))

    const contextResult = await this.loadPrejoinContextUseCase.execute({
      roomId,
      requestedRole: role
    })

    if (!this.isActualConfigureRoomRequest(requestId)) {
      return
    }

    if (!contextResult.ok) {
      const message = prejoinContextErrorMessage(contextResult.error.type)

      this.updateState((state) => ({
        ...state,
        loading: false,
        error: message
      }))

      this.effects.emit({ type: 'load-failed', message })
      return
    }

    const preferences = contextResult.value.preferences

    this.updateState((state) => ({
      ...state,
      devices: contextResult.value.devices,
      role,
      displayName: {
        value: preferences.displayName ?? '',
        error: null,
        showError: false
      },
      micEnabled: preferences.defaultMicEnabled,
      cameraEnabled: preferences.defaultCameraEnabled,
      selectedMicrophoneId: preferences.preferredMicrophoneId,
      selectedCameraId: preferences.preferredCameraId,
      audioProcessing: preferences.audioProcessing
    }))

    // После загрузки контекста сразу запускаем локальный preview с выбранными настройками.
    await this.startPreview(requestId)

    if (!this.isActualConfigureRoomRequest(requestId)) {
      return
    }

    this.updateState((state) => ({
      ...state,
      loading: false
    }))
  }

  private updateDisplayName(value: string) {
    const trimmed = value.trim()

    this.updateState((state) => ({
      ...state,
      displayName: {
        value,
        error: trimmed ? null : 'prejoin.errors.nameRequired',
        showError: state.displayName.showError && !trimmed
      }
    }))
  }

  private async updateMicrophone(enabled: boolean) {
    const requestId = ++this.microphoneRequestId

    this.updateState((state) => ({
      ...state,
      micEnabled: enabled,
      preview: state.preview
        ? {
            ...state.preview,
            micEnabled: enabled
          }
        : state.preview
    }))

    const result = await this.setMicrophoneEnabledUseCase.execute(enabled)

    if (!this.isActualMicrophoneRequest(requestId)) {
      return
    }

    if (result.ok) {
      return
    }

    const message = mediaErrorMessage(result.error.type)

    this.updateState((state) => ({
      ...state,
      error: message,
      // При ошибке считаем микрофон выключенным, а не откатываем в старое значение.
      micEnabled: false,
      preview: state.preview
        ? {
            ...state.preview,
            micEnabled: false
          }
        : state.preview
    }))

    this.effects.emit({ type: 'preview-failed', message })
  }

  private async updateCamera(enabled: boolean) {
    const requestId = ++this.cameraRequestId

    this.updateState((state) => ({
      ...state,
      cameraEnabled: enabled,
      preview: state.preview
        ? {
            ...state.preview,
            cameraEnabled: enabled,
            previewAvailable: enabled,
            status: enabled ? 'ready' : 'idle'
          }
        : state.preview
    }))

    const result = await this.setCameraEnabledUseCase.execute(enabled)

    if (!this.isActualCameraRequest(requestId)) {
      return
    }

    if (result.ok) {
      return
    }

    const message = mediaErrorMessage(result.error.type)

    this.updateState((state) => ({
      ...state,
      error: message,
      // При ошибке считаем камеру выключенной, потому что включить её не удалось.
      cameraEnabled: false,
      preview: state.preview
        ? {
            ...state.preview,
            cameraEnabled: false,
            previewAvailable: false,
            status: 'idle'
          }
        : state.preview
    }))

    this.effects.emit({ type: 'preview-failed', message })
  }

  private async selectMicrophone(deviceId: string | null) {
    this.updateState((state) => ({
      ...state,
      selectedMicrophoneId: deviceId
    }))

    // Выбор нового устройства должен примениться к локальному preview.
    await this.startPreview()
  }

  private async selectCamera(deviceId: string | null) {
    this.updateState((state) => ({
      ...state,
      selectedCameraId: deviceId
    }))

    // Выбор нового устройства должен примениться к локальному preview.
    await this.startPreview()
  }

  private async join() {
    const state = this.state.value
    const displayName = state.displayName.value.trim()

    if (!displayName) {
      this.updateState((current) => ({
        ...current,
        displayName: {
          ...current.displayName,
          error: 'prejoin.errors.nameRequired',
          showError: true
        }
      }))

      this.effects.emit({ type: 'join-failed', message: 'prejoin.errors.enterName' })
      return
    }

    if (!this.canJoin(state)) {
      const message = state.error ?? 'prejoin.errors.mediaUnavailable'

      this.effects.emit({ type: 'join-failed', message })
      return
    }

    this.updateState((current) => ({
      ...current,
      error: null,
      joinButton: {
        ...current.joinButton,
        loading: true
      }
    }))

    const result = await this.joinRoomFlowUseCase.execute({
      roomId: state.roomId,
      displayName,
      micEnabled: state.micEnabled,
      cameraEnabled: state.cameraEnabled,
      microphoneDeviceId: state.selectedMicrophoneId,
      cameraDeviceId: state.selectedCameraId,
      role: state.role
    })

    if (result.ok) {
      this.updateState((current) => ({
        ...current,
        joinButton: {
          ...current.joinButton,
          loading: false
        }
      }))

      this.effects.emit({ type: 'joined', roomId: result.value.session.roomId })
      return
    }

    const message = prejoinJoinErrorMessage(result.error.type)

    this.updateState((current) => ({
      ...current,
      error: message,
      joinButton: {
        ...current.joinButton,
        loading: false
      }
    }))

    this.effects.emit({ type: 'join-failed', message })
  }

  private async startPreview(configureRoomRequestId?: number) {
    const requestId = ++this.startPreviewRequestId

    this.previewStarting = true
    this.updateState((state) => state)

    const state = this.state.value

    const result = await this.startPrejoinPreviewUseCase.execute({
      displayName: state.displayName.value,
      micEnabled: state.micEnabled,
      cameraEnabled: state.cameraEnabled,
      microphoneDeviceId: state.selectedMicrophoneId,
      cameraDeviceId: state.selectedCameraId,
      noiseSuppressionEnabled: true,
      audioProcessing: state.audioProcessing
    })

    if (!this.isActualStartPreviewRequest(requestId)) {
      return
    }

    this.previewStarting = false

    if (
      configureRoomRequestId !== undefined &&
      !this.isActualConfigureRoomRequest(configureRoomRequestId)
    ) {
      this.updateState((current) => current)
      return
    }

    if (result.ok) {
      this.updateState((current) => ({
        ...current,
        error: null
      }))

      return
    }

    const message = mediaErrorMessage(result.error.type)

    this.updateState((current) => ({
      ...current,
      micEnabled: false,
      cameraEnabled: false,
      error: message,
      preview: current.preview
        ? {
            ...current.preview,
            micEnabled: false,
            cameraEnabled: false,
            previewAvailable: false,
            status: 'idle'
          }
        : current.preview
    }))

    this.effects.emit({ type: 'preview-failed', message })
  }

  private updateState(updater: (state: PrejoinUiState) => PrejoinUiState) {
    this.state.update((state) => {
      const nextState = updater(state)

      return {
        ...nextState,
        joinButton: {
          ...nextState.joinButton,
          // joinButton.enabled — производное состояние, поэтому пересчитываем его централизованно.
          enabled: this.canJoin(nextState)
        }
      }
    })
  }

  private canJoin(state: PrejoinUiState): boolean {
    const hasDisplayName = state.displayName.value.trim().length > 0
    const mediaReady = this.isMediaReadyToJoin(state)

    return (
      hasDisplayName &&
      mediaReady &&
      !state.error &&
      !state.loading &&
      !state.joinButton.loading &&
      !this.previewStarting
    )
  }

  private isMediaReadyToJoin(state: PrejoinUiState): boolean {
    if (!state.preview) {
      return false
    }

    // Вход без камеры разрешён, поэтому ready-статус нужен только при включенной камере.
    if (!state.cameraEnabled) {
      return true
    }

    return state.preview.status === 'ready'
  }

  private isActualConfigureRoomRequest(requestId: number): boolean {
    return requestId === this.configureRoomRequestId
  }

  private isActualStartPreviewRequest(requestId: number): boolean {
    return requestId === this.startPreviewRequestId
  }

  private isActualMicrophoneRequest(requestId: number): boolean {
    return requestId === this.microphoneRequestId
  }

  private isActualCameraRequest(requestId: number): boolean {
    return requestId === this.cameraRequestId
  }
}

const prejoinContextErrorMessages = {
  'room-not-found': 'prejoin.errors.roomNotFound',
  'media-unavailable': 'prejoin.errors.mediaUnavailable',
  'unknown-error': 'prejoin.errors.load'
} satisfies Record<PrejoinContextError, PrejoinErrorMessageKey>

const mediaErrorMessages = {
  'permission-denied': 'prejoin.errors.permissionDenied',
  'device-not-found': 'prejoin.errors.deviceNotFound',
  'device-busy': 'prejoin.errors.deviceBusy',
  'insecure-context': 'prejoin.errors.insecureContext',
  'api-unavailable': 'prejoin.errors.apiUnavailable',
  'unknown-error': 'prejoin.errors.preview'
} satisfies Record<MediaError, PrejoinErrorMessageKey>

const prejoinJoinErrorMessages = {
  'display-name-empty': 'prejoin.errors.enterName',
  'room-not-found': 'prejoin.errors.roomNotFound',
  'join-failed': 'prejoin.errors.join',
  'preferences-save-failed': 'prejoin.errors.join',
  'unknown-error': 'prejoin.errors.join'
} satisfies Record<PrejoinJoinError, PrejoinErrorMessageKey>

function prejoinContextErrorMessage(error: PrejoinContextError): PrejoinErrorMessageKey {
  return prejoinContextErrorMessages[error]
}

function mediaErrorMessage(error: MediaError): PrejoinErrorMessageKey {
  return mediaErrorMessages[error]
}

function prejoinJoinErrorMessage(error: PrejoinJoinError): PrejoinErrorMessageKey {
  return prejoinJoinErrorMessages[error]
}
