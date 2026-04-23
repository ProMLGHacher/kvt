import { MutableSharedFlow, MutableStateFlow, ViewModel } from '@kvt/core'
import {
  initialHomeState,
  type HomeUiAction,
  type HomeUiEffect,
  type HomeUiState
} from '../model/HomeState'
import type { CreateRoomFlowUseCase } from '@features/home/domain/usecases/CreateRoomFlowUseCase'
import type { JoinRoomFlowUseCase } from '@features/home/domain/usecases/JoinRoomFlowUseCase'

export class HomeViewModel extends ViewModel {
  private readonly state = new MutableStateFlow<HomeUiState>(initialHomeState)
  private readonly effects = new MutableSharedFlow<HomeUiEffect>()

  readonly uiState = this.state.asStateFlow()
  readonly uiEffect = this.effects.asSharedFlow()

  constructor(
    private readonly createRoomFlowUseCase: CreateRoomFlowUseCase,
    private readonly joinRoomFlowUseCase: JoinRoomFlowUseCase
  ) {
    super()
  }

  onEvent(event: HomeUiAction) {
    switch (event.type) {
      case 'join-pressed':
        void this.openTypedRoom()
        break
      case 'create-room-pressed':
        void this.createRoom()
        break
      case 'id-or-link-to-join-changed':
        this.updateIdOrLink(event.value)
        break
      default:
        throw new Error(`Unknown event: ${JSON.stringify(event)}`)
    }
  }

  private updateIdOrLink(value: string) {
    const trimmed = value.trim()
    const enabled = trimmed.length > 0

    this.state.update((state) => ({
      ...state,
      idOrLinkToJoinState: {
        value,
        error: enabled ? null : 'home.errors.roomInputRequired',
        showError: false
      },
      joinButtonState: { ...state.joinButtonState, enabled },
      feedback: null
    }))
  }

  private async createRoom() {
    this.state.update((state) => ({
      ...state,
      createRoomButtonState: { ...state.createRoomButtonState, loading: true, enabled: false }
    }))

    const result = await this.createRoomFlowUseCase.execute()
    this.state.update((state) => ({
      ...state,
      createRoomButtonState: { ...state.createRoomButtonState, loading: false, enabled: true }
    }))

    if (result.ok) {
      this.effects.emit({ type: 'open-room', roomId: result.value.roomId })
    } else {
      this.effects.emit({ type: 'show-message', message: 'home.errors.createRoom' })
    }
  }

  private async openTypedRoom() {
    this.state.update((state) => ({
      ...state,
      joinButtonState: { ...state.joinButtonState, loading: true, enabled: false },
      feedback: null
    }))

    const result = await this.joinRoomFlowUseCase.execute({
      idOrLink: this.state.value.idOrLinkToJoinState.value
    })

    if (!result.ok) {
      const message = homeJoinErrorMessage(result.error.type)
      this.state.update((state) => ({
        ...state,
        idOrLinkToJoinState: {
          ...state.idOrLinkToJoinState,
          error: message,
          showError: true
        },
        joinButtonState: { ...state.joinButtonState, loading: false, enabled: true },
        feedback: message
      }))
      return
    }

    this.state.update((state) => ({
      ...state,
      joinButtonState: { ...state.joinButtonState, loading: false, enabled: true }
    }))
    this.effects.emit({ type: 'open-room', roomId: result.value.roomId })
  }
}

function homeJoinErrorMessage(error: 'invalid-room-input' | 'room-not-found' | 'unknown-error') {
  switch (error) {
    case 'invalid-room-input':
      return 'home.errors.invalidRoom'
    case 'room-not-found':
      return 'home.errors.roomNotFound'
    default:
      return 'home.errors.checkRoom'
  }
}
