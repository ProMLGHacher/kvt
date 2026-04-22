import { MutableStateFlow, err, ok, type PromiseResult } from '@kvt/core'
import type {
  ConnectRtcParams,
  RtcDiagnostics,
  RtcError,
  RtcSession
} from '@capabilities/rtc/domain/model'
import type { RtcRepository } from '@capabilities/rtc/domain/repository/RtcRepository'
import { ConferenceClient, type ConferenceDiagnostics } from '../infra/conference-client'
import type { RoomSnapshot, SlotUpdatedPayload } from '../infra/protocol'

const initialSession: RtcSession = {
  roomId: '',
  participantId: '',
  status: 'idle',
  snapshot: null
}

export class BrowserRtcRepository implements RtcRepository {
  private readonly sessionState = new MutableStateFlow<RtcSession>(initialSession)
  private readonly diagnosticsState = new MutableStateFlow<RtcDiagnostics | null>(null)
  private client: ConferenceClient | null = null

  readonly session = this.sessionState.asStateFlow()
  readonly diagnostics = this.diagnosticsState.asStateFlow()

  async connect(params: ConnectRtcParams): PromiseResult<void, RtcError> {
    this.disconnect()
    this.sessionState.set({
      roomId: params.roomId,
      participantId: params.participantId,
      status: 'connecting',
      snapshot: null
    })

    this.client = new ConferenceClient({
      onSnapshot: (snapshot) => this.applySnapshot(params.participantId, snapshot),
      onSlotUpdated: (slot) => this.applySlotUpdate(slot),
      onRemoteTrack: () => undefined,
      onRemoteStreamsReset: () => undefined,
      onLocalStream: () => undefined,
      onStateChange: (state) => this.updateStatus(state),
      onDiagnostics: (diagnostics) => this.updateDiagnostics(diagnostics),
      onError: (message) => {
        this.diagnosticsState.set({
          ...(this.diagnosticsState.value ?? emptyDiagnostics()),
          lastError: message
        })
      }
    })

    try {
      await this.client.start({
        wsUrl: params.wsUrl,
        iceServers: params.iceServers.map((server) => ({
          urls: [...server.urls],
          username: server.username,
          credential: server.credential
        })),
        micEnabled: params.micEnabled,
        cameraEnabled: params.cameraEnabled
      })
      return ok(undefined)
    } catch (error) {
      return err({ type: 'unknown-error', message: readableError(error) })
    }
  }

  disconnect(): void {
    this.client?.close()
    this.client = null
    this.sessionState.update((session) => ({ ...session, status: 'closed' }))
  }

  async setMicrophoneEnabled(enabled: boolean): PromiseResult<void, RtcError> {
    try {
      await this.client?.setMicEnabled(enabled)
      return ok(undefined)
    } catch (error) {
      return err({ type: 'media-publish-failed', message: readableError(error) })
    }
  }

  async setCameraEnabled(enabled: boolean): PromiseResult<void, RtcError> {
    try {
      await this.client?.setCameraEnabled(enabled)
      return ok(undefined)
    } catch (error) {
      return err({ type: 'media-publish-failed', message: readableError(error) })
    }
  }

  async setScreenShareEnabled(enabled: boolean): PromiseResult<void, RtcError> {
    try {
      await this.client?.setScreenEnabled(enabled)
      return ok(undefined)
    } catch (error) {
      return err({ type: 'media-publish-failed', message: readableError(error) })
    }
  }

  async restartIce(): PromiseResult<void, RtcError> {
    return ok(undefined)
  }

  async forceRelayTransport(): PromiseResult<void, RtcError> {
    return ok(undefined)
  }

  private applySnapshot(participantId: string, snapshot: RoomSnapshot) {
    this.sessionState.set({
      roomId: snapshot.roomId,
      participantId,
      status: 'connected',
      snapshot: {
        roomId: snapshot.roomId,
        hostParticipantId: snapshot.hostParticipantId,
        participants: snapshot.participants.map((participant) => ({
          ...participant,
          slots: participant.slots.map((slot) => ({
            ...slot,
            participantId: participant.id
          }))
        }))
      }
    })
  }

  private applySlotUpdate(slot: SlotUpdatedPayload) {
    const snapshot = this.sessionState.value.snapshot
    if (!snapshot) {
      return
    }

    this.sessionState.update((session) => ({
      ...session,
      snapshot: {
        ...snapshot,
        participants: snapshot.participants.map((participant) =>
          participant.id === slot.participantId
            ? {
                ...participant,
                slots: participant.slots.map((currentSlot) =>
                  currentSlot.kind === slot.kind
                    ? {
                        ...currentSlot,
                        enabled: slot.enabled,
                        publishing: slot.publishing,
                        trackBound: slot.trackBound,
                        revision: currentSlot.revision + 1
                      }
                    : currentSlot
                )
              }
            : participant
        )
      }
    }))
  }

  private updateStatus(state: string) {
    this.sessionState.update((session) => ({
      ...session,
      status: mapConnectionStatus(state)
    }))
  }

  private updateDiagnostics(diagnostics: ConferenceDiagnostics) {
    this.diagnosticsState.set({
      signalingState: diagnostics.signalingState,
      publisherConnectionState: diagnostics.publisher.connectionState,
      publisherIceState: diagnostics.publisher.iceConnectionState,
      subscriberConnectionState: diagnostics.subscriber.connectionState,
      subscriberIceState: diagnostics.subscriber.iceConnectionState,
      recentSignalsSent: diagnostics.recentSignalsSent,
      recentSignalsReceived: diagnostics.recentSignalsReceived,
      lastError: diagnostics.lastError
    })
  }
}

function mapConnectionStatus(state: string): RtcSession['status'] {
  if (state === 'connected' || state === 'completed') return 'connected'
  if (state === 'checking' || state === 'connecting' || state === 'new') return 'connecting'
  if (state === 'disconnected') return 'reconnecting'
  if (state === 'failed') return 'failed'
  if (state === 'closed') return 'closed'
  return 'idle'
}

function emptyDiagnostics(): RtcDiagnostics {
  return {
    signalingState: 'idle',
    publisherConnectionState: 'not-created',
    publisherIceState: 'not-created',
    subscriberConnectionState: 'not-created',
    subscriberIceState: 'not-created',
    recentSignalsSent: [],
    recentSignalsReceived: [],
    lastError: null
  }
}

function readableError(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
