import type { VoiceActivitySource } from '@capabilities/voice-activity/domain/model/VoiceActivitySource'
import type { RoomUiState } from '../model/RoomState'
import { participantHasEnabledSlot } from './room-slot-helpers'

export function buildVoiceActivitySources(state: RoomUiState): VoiceActivitySource[] {
  const sources: VoiceActivitySource[] = []

  for (const participant of state.participants) {
    const mediaStreams =
      participant.id === state.localParticipantId
        ? state.localMediaStreams
        : (state.remoteMediaStreams[participant.id] ?? {})

    sources.push({
      id: participant.id,
      stream: mediaStreams.audio ?? null,
      enabled: participantHasEnabledSlot(participant, 'audio')
    })
  }

  return sources
}
