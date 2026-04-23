import { CompositeDisposable, MutableSharedFlow, MutableStateFlow, ViewModel } from '@kvt/core'
import type { Participant } from '@features/room/domain/model/Participant'
import type { RtcDiagnostics, RtcSession } from '@capabilities/rtc/domain/model'
import type { ConnectToRoomRtcUseCase } from '@capabilities/rtc/domain/usecases/ConnectToRoomRtcUseCase'
import type { LoadJoinSessionUseCase } from '@capabilities/session/domain/usecases/LoadJoinSessionUseCase'
import type { StoredJoinSession } from '@capabilities/session/domain/model/JoinSession'
import type { ClearJoinSessionUseCase } from '@capabilities/session/domain/usecases/ClearJoinSessionUseCase'
import type { ExportClientLogsUseCase } from '@capabilities/client-logs/domain/usecases/ExportClientLogsUseCase'
import type { ClearClientLogsUseCase } from '@capabilities/client-logs/domain/usecases/ClearClientLogsUseCase'
import type { CopyRoomLinkUseCase } from '@features/room/domain/usecases/CopyRoomLinkUseCase'
import type { LeaveRoomUseCase } from '@features/room/domain/usecases/LeaveRoomUseCase'
import type { ObserveRoomDiagnosticsUseCase } from '@features/room/domain/usecases/ObserveRoomDiagnosticsUseCase'
import type { ObserveRoomSessionUseCase } from '@features/room/domain/usecases/ObserveRoomSessionUseCase'
import type { ToggleRoomCameraUseCase } from '@features/room/domain/usecases/ToggleRoomCameraUseCase'
import type { ToggleRoomMicrophoneUseCase } from '@features/room/domain/usecases/ToggleRoomMicrophoneUseCase'
import type { ToggleRoomScreenShareUseCase } from '@features/room/domain/usecases/ToggleRoomScreenShareUseCase'
import {
  initialRoomState,
  type RoomUiAction,
  type RoomUiEffect,
  type RoomUiState
} from '../model/RoomState'

export class RoomViewModel extends ViewModel {
  private readonly state = new MutableStateFlow<RoomUiState>(initialRoomState)
  private readonly effects = new MutableSharedFlow<RoomUiEffect>()
  private latestDiagnostics: RtcDiagnostics | null = null

  readonly uiState = this.state.asStateFlow()
  readonly uiEffect = this.effects.asSharedFlow()

  constructor(
    private readonly loadJoinSessionUseCase: LoadJoinSessionUseCase,
    private readonly connectToRoomRtcUseCase: ConnectToRoomRtcUseCase,
    private readonly observeRoomSessionUseCase: ObserveRoomSessionUseCase,
    private readonly observeRoomDiagnosticsUseCase: ObserveRoomDiagnosticsUseCase,
    private readonly toggleRoomMicrophoneUseCase: ToggleRoomMicrophoneUseCase,
    private readonly toggleRoomCameraUseCase: ToggleRoomCameraUseCase,
    private readonly toggleRoomScreenShareUseCase: ToggleRoomScreenShareUseCase,
    private readonly copyRoomLinkUseCase: CopyRoomLinkUseCase,
    private readonly exportClientLogsUseCase: ExportClientLogsUseCase,
    private readonly clearClientLogsUseCase: ClearClientLogsUseCase,
    private readonly clearJoinSessionUseCase: ClearJoinSessionUseCase,
    private readonly leaveRoomUseCase: LeaveRoomUseCase
  ) {
    super()
  }

  protected override onInit() {
    const disposables = new CompositeDisposable()
    disposables.add(
      this.observeRoomSessionUseCase.execute().subscribe((session) => {
        this.state.update((state) => {
          const next = {
            ...state,
            status: session.status,
            roomId: session.roomId || state.roomId,
            localParticipantId: session.participantId || state.localParticipantId,
            participants: (session.snapshot?.participants ?? state.participants) as Participant[],
            localStream: session.localStream,
            remoteStreams: session.remoteStreams
          }
          return {
            ...next,
            diagnostics: createDiagnostics(next, session, this.latestDiagnostics)
          }
        })
      })
    )
    disposables.add(
      this.observeRoomDiagnosticsUseCase.execute().subscribe((diagnostics) => {
        this.latestDiagnostics = diagnostics
        this.state.update((state) => ({
          ...state,
          diagnostics: createDiagnostics(state, null, diagnostics)
        }))
      })
    )
    return disposables
  }

  onEvent(event: RoomUiAction) {
    switch (event.type) {
      case 'room-opened':
        void this.openRoom(event.roomId)
        break
      case 'prejoin-completed':
        void this.enterRoom()
        break
      case 'microphone-toggled':
        void this.toggleMicrophone()
        break
      case 'camera-toggled':
        void this.toggleCamera()
        break
      case 'screen-share-toggled':
        void this.toggleScreenShare()
        break
      case 'copy-link-pressed':
        void this.copyRoomLink()
        break
      case 'export-logs-pressed':
        this.exportLogs()
        break
      case 'clear-logs-pressed':
        this.effects.emit({ type: 'show-toast', message: 'room.toasts.logsCleared' })
        this.clearClientLogsUseCase.execute()
        this.state.update((state) => ({ ...state, actionStatus: 'room.status.logsCleared' }))
        break
      case 'leave-pressed':
        void this.leaveRoom()
        break
      case 'technical-info-toggled':
        this.state.update((state) => ({ ...state, technicalInfoVisible: event.visible }))
        break
      default:
        throw new Error(`Unknown event: ${JSON.stringify(event)}`)
    }
  }

  private async openRoom(roomId: string) {
    if (!roomId.trim()) {
      this.effects.emit({ type: 'navigate-home' })
      return
    }

    if (this.state.value.roomId === roomId) {
      return
    }

    this.state.update((state) => ({
      ...state,
      roomId,
      prejoinOpen: true,
      status: 'idle',
      participants: [],
      localParticipantId: null,
      localStream: null,
      remoteStreams: {},
      actionStatus: 'room.status.chooseSettings',
      diagnostics: null
    }))

    const storedSession = await this.loadJoinSessionUseCase.execute(roomId)
    if (storedSession.ok) {
      this.state.update((state) => ({ ...state, prejoinOpen: false }))
      await this.connectStoredSession(storedSession.value)
    }
  }

  private async enterRoom() {
    const storedSession = await this.loadJoinSessionUseCase.execute(this.state.value.roomId)
    if (!storedSession.ok) {
      this.effects.emit({ type: 'show-toast', message: 'room.toasts.sessionMissing' })
      return
    }

    this.state.update((state) => ({ ...state, prejoinOpen: false }))
    await this.connectStoredSession(storedSession.value)
  }

  private async toggleMicrophone() {
    const enabled = !this.state.value.microphone.enabled
    const result = await this.toggleRoomMicrophoneUseCase.execute(enabled)
    if (!result.ok) {
      this.effects.emit({ type: 'show-toast', message: 'room.toasts.microphoneFailed' })
      return
    }

    this.state.update((state) => {
      return {
        ...state,
        microphone: { ...state.microphone, enabled },
        participants: updateLocalSlot(state, 'audio', enabled, true),
        actionStatus: enabled ? 'room.status.microphoneOn' : 'room.status.microphoneMuted'
      }
    })
  }

  private async toggleCamera() {
    const enabled = !this.state.value.camera.enabled
    const result = await this.toggleRoomCameraUseCase.execute(enabled)
    if (!result.ok) {
      this.effects.emit({ type: 'show-toast', message: 'room.toasts.cameraFailed' })
      return
    }

    this.state.update((state) => {
      return {
        ...state,
        camera: { ...state.camera, enabled },
        participants: updateLocalSlot(state, 'camera', enabled, enabled),
        actionStatus: enabled ? 'room.status.cameraOn' : 'room.status.cameraOff'
      }
    })
  }

  private async toggleScreenShare() {
    const enabled = !this.state.value.screenShare.enabled
    const result = await this.toggleRoomScreenShareUseCase.execute(enabled)
    if (!result.ok) {
      this.effects.emit({ type: 'show-toast', message: 'room.toasts.screenFailed' })
      return
    }

    this.state.update((state) => {
      return {
        ...state,
        screenShare: { ...state.screenShare, enabled },
        participants: updateLocalSlot(state, 'screen', enabled, enabled),
        actionStatus: enabled ? 'room.status.screenStarted' : 'room.status.screenStopped'
      }
    })
  }

  private async copyRoomLink() {
    const result = await this.copyRoomLinkUseCase.execute({
      roomId: this.state.value.roomId,
      origin: window.location.origin
    })
    this.effects.emit({
      type: 'show-toast',
      message: result.ok ? 'room.toasts.linkCopied' : 'room.toasts.linkCopyFailed'
    })
    this.state.update((state) => ({
      ...state,
      actionStatus: result.ok ? 'room.status.linkCopied' : 'room.status.linkCopyFailed'
    }))
  }

  private exportLogs() {
    this.effects.emit({ type: 'download-logs', ...this.exportClientLogsUseCase.execute() })
    this.effects.emit({ type: 'show-toast', message: 'room.toasts.logsPrepared' })
  }

  private async connectStoredSession(session: StoredJoinSession) {
    const result = await this.connectToRoomRtcUseCase.execute({
      roomId: session.roomId,
      participantId: session.participantId,
      wsUrl: session.wsUrl,
      iceServers: session.iceServers,
      micEnabled: hasEnabledSlot(session.snapshot.participants, session.participantId, 'audio'),
      cameraEnabled: hasEnabledSlot(session.snapshot.participants, session.participantId, 'camera')
    })

    if (!result.ok) {
      this.effects.emit({ type: 'show-toast', message: 'room.toasts.mediaFailed' })
      return
    }

    this.state.update((state) => ({
      ...state,
      status: 'connecting',
      participants: session.snapshot.participants as Participant[],
      localParticipantId: session.participantId,
      localStream: state.localStream,
      remoteStreams: state.remoteStreams,
      microphone: {
        ...state.microphone,
        enabled: hasEnabledSlot(session.snapshot.participants, session.participantId, 'audio')
      },
      camera: {
        ...state.camera,
        enabled: hasEnabledSlot(session.snapshot.participants, session.participantId, 'camera')
      },
      actionStatus: 'room.status.mediaStarting'
    }))
  }

  private async leaveRoom() {
    this.leaveRoomUseCase.execute()
    await this.clearJoinSessionUseCase.execute(this.state.value.roomId)
    this.effects.emit({ type: 'navigate-home' })
  }
}

function createDiagnostics(
  state: RoomUiState,
  session: RtcSession | null,
  rtcDiagnostics: RtcDiagnostics | null
): RoomUiState['diagnostics'] {
  const nextSession = session ?? null
  const roomId = nextSession?.roomId || state.roomId || 'not selected'
  const participants = nextSession?.snapshot?.participants ?? state.participants
  const localStream = nextSession?.localStream ?? state.localStream
  const remoteStreams = nextSession?.remoteStreams ?? state.remoteStreams
  const diagnostics = rtcDiagnostics

  return {
    room: [
      `Room id: ${roomId}`,
      `Participants: ${participants.length}`,
      `Local participant: ${nextSession?.participantId || state.localParticipantId || 'missing'}`,
      `Remote streams: ${Object.keys(remoteStreams).length}`
    ],
    publisher: [
      `Connection: ${diagnostics?.publisherConnectionState ?? state.status}`,
      `ICE: ${diagnostics?.publisherIceState ?? 'unknown'}`,
      `Local tracks: ${describeStreamTracks(localStream)}`
    ],
    subscriber: [
      `Connection: ${diagnostics?.subscriberConnectionState ?? 'unknown'}`,
      `ICE: ${diagnostics?.subscriberIceState ?? 'unknown'}`,
      `Remote streams: ${Object.keys(remoteStreams).length}`
    ],
    signaling: [
      `Socket: ${diagnostics?.signalingState ?? 'unknown'}`,
      `Sent: ${formatSignals(diagnostics?.recentSignalsSent)}`,
      `Received: ${formatSignals(diagnostics?.recentSignalsReceived)}`,
      `Last error: ${diagnostics?.lastError ?? 'none'}`
    ]
  }
}

function describeStreamTracks(stream: MediaStream | null): string {
  if (!stream) {
    return 'none'
  }

  const audio = stream.getAudioTracks().filter((track) => track.readyState === 'live').length
  const video = stream.getVideoTracks().filter((track) => track.readyState === 'live').length
  return `audio=${audio}, video=${video}`
}

function formatSignals(signals: readonly string[] | undefined): string {
  if (!signals?.length) {
    return 'none'
  }

  return signals.slice(-6).join(', ')
}

function updateLocalSlot(
  state: RoomUiState,
  kind: Participant['slots'][number]['kind'],
  enabled: boolean,
  publishing: boolean
): readonly Participant[] {
  return state.participants.map((participant) => {
    if (participant.id !== state.localParticipantId) {
      return participant
    }

    return {
      ...participant,
      slots: participant.slots.map((slot) =>
        slot.kind === kind
          ? {
              ...slot,
              enabled,
              publishing,
              trackBound: publishing,
              revision: slot.revision + 1
            }
          : slot
      )
    }
  })
}

function hasEnabledSlot(
  participants: readonly Participant[],
  participantId: string,
  kind: Participant['slots'][number]['kind']
): boolean {
  return (
    participants
      .find((participant) => participant.id === participantId)
      ?.slots.some((slot) => slot.kind === kind && slot.enabled) ?? false
  )
}
