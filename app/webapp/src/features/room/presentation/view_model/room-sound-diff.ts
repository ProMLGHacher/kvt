import type { ConferenceSound } from '@capabilities/conference-audio/domain/model/ConferenceSound'
import type { Participant } from '@features/room/domain/model/Participant'
import { participantHasEnabledSlot, participantsById } from './room-slot-helpers'

export function diffRemoteConferenceSounds(
  previousParticipants: readonly Participant[],
  nextParticipants: readonly Participant[],
  localParticipantId: string
): ConferenceSound[] {
  const sounds: ConferenceSound[] = []
  const previousById = participantsById(previousParticipants)
  const nextById = participantsById(nextParticipants)

  for (const participant of nextParticipants) {
    if (participant.id === localParticipantId) {
      continue
    }

    const previousParticipant = previousById.get(participant.id)

    if (!previousParticipant) {
      sounds.push('participant-incoming')
      continue
    }

    sounds.push(...diffRemoteSlotSounds(previousParticipant, participant))
  }

  for (const participant of previousParticipants) {
    if (participant.id !== localParticipantId && !nextById.has(participant.id)) {
      sounds.push('participant-outgoing')
    }
  }

  return sounds
}

function diffRemoteSlotSounds(
  previousParticipant: Participant,
  nextParticipant: Participant
): ConferenceSound[] {
  const sounds: ConferenceSound[] = []

  pushToggleSound(
    sounds,
    participantHasEnabledSlot(previousParticipant, 'audio'),
    participantHasEnabledSlot(nextParticipant, 'audio'),
    'microphone-on',
    'microphone-off'
  )
  pushToggleSound(
    sounds,
    participantHasEnabledSlot(previousParticipant, 'camera'),
    participantHasEnabledSlot(nextParticipant, 'camera'),
    'camera-on',
    'camera-off'
  )

  const wasScreenSharing = participantHasEnabledSlot(previousParticipant, 'screen')
  const isScreenSharing = participantHasEnabledSlot(nextParticipant, 'screen')

  if (!wasScreenSharing && isScreenSharing) {
    sounds.push('screen-share-incoming')
  } else if (wasScreenSharing && !isScreenSharing) {
    sounds.push('screen-share-stopped-incoming')
  }

  return sounds
}

function pushToggleSound(
  sounds: ConferenceSound[],
  wasEnabled: boolean,
  isEnabled: boolean,
  enabledSound: ConferenceSound,
  disabledSound: ConferenceSound
) {
  if (wasEnabled !== isEnabled) {
    sounds.push(isEnabled ? enabledSound : disabledSound)
  }
}
