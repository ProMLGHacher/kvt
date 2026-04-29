import type { RtcDiagnostics, RtcSession } from '@capabilities/rtc/domain/model'
import type { RoomUiState } from '../model/RoomState'

export function createDiagnostics(
  state: RoomUiState,
  session: RtcSession | null,
  rtcDiagnostics: RtcDiagnostics | null
): RoomUiState['diagnostics'] {
  const nextSession = session ?? null
  const roomId = nextSession?.roomId || state.roomId || 'not selected'
  const participants = nextSession?.snapshot?.participants ?? state.participants
  const localMediaStreams = nextSession?.localMediaStreams ?? state.localMediaStreams
  const remoteMediaStreams = nextSession?.remoteMediaStreams ?? state.remoteMediaStreams
  const diagnostics = rtcDiagnostics

  return {
    room: [
      `Room id: ${roomId}`,
      `Participants: ${participants.length}`,
      `Local participant: ${nextSession?.participantId || state.localParticipantId || 'missing'}`,
      `Remote streams: ${Object.keys(remoteMediaStreams).length}`
    ],
    publisher: [
      `Connection: ${diagnostics?.publisherConnectionState ?? state.status}`,
      `ICE: ${diagnostics?.publisherIceState ?? 'unknown'}`,
      `Local slots: mic=${Boolean(localMediaStreams.audio)} / camera=${Boolean(localMediaStreams.camera)} / screen=${Boolean(localMediaStreams.screen)} / screenAudio=${Boolean(localMediaStreams.screenAudio)}`
    ],
    subscriber: [
      `Connection: ${diagnostics?.subscriberConnectionState ?? 'unknown'}`,
      `ICE: ${diagnostics?.subscriberIceState ?? 'unknown'}`,
      `Remote streams: ${Object.keys(remoteMediaStreams).length}`
    ],
    signaling: [
      `Socket: ${diagnostics?.signalingState ?? 'unknown'}`,
      `Sent: ${formatSignals(diagnostics?.recentSignalsSent)}`,
      `Received: ${formatSignals(diagnostics?.recentSignalsReceived)}`,
      `Last error: ${diagnostics?.lastError ?? 'none'}`
    ]
  }
}

function formatSignals(signals: readonly string[] | undefined): string {
  if (!signals?.length) {
    return 'none'
  }

  return signals.slice(-6).join(', ')
}
