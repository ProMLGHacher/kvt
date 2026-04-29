import { Fragment } from 'react'
import type { TFunction } from 'i18next'
import { Empty, ScrollArea } from '@core/design-system'
import type { RtcMediaStreams } from '@capabilities/rtc/domain/model'
import type { Participant } from '@features/room/domain/model/Participant'
import { ParticipantAudio } from './ParticipantAudio'
import { ParticipantTile } from './ParticipantTile'
import { buildParticipantTiles, slotEnabled } from './room-tile-model'

type VoiceT = TFunction<'voice'>

export interface ConferenceStageProps {
  readonly participants: readonly Participant[]
  readonly localParticipantId: string | null
  readonly localMediaStreams: RtcMediaStreams
  readonly remoteMediaStreams: Readonly<Record<string, RtcMediaStreams>>
  readonly pinnedTileId: string | null
  readonly speakingParticipantIds: readonly string[]
  readonly onPin: (tileId: string) => void
  readonly t: VoiceT
}

export function ConferenceStage({
  participants,
  localParticipantId,
  localMediaStreams,
  remoteMediaStreams,
  pinnedTileId,
  speakingParticipantIds,
  onPin,
  t
}: ConferenceStageProps) {
  if (!participants.length) {
    return (
      <Empty className="min-h-[24rem] rounded-4xl bg-surface">
        <div>
          <p className="text-2xl font-medium text-foreground">{t('room.empty.title')}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t('room.empty.description')}</p>
        </div>
      </Empty>
    )
  }

  const tiles = buildParticipantTiles(
    participants,
    localParticipantId,
    localMediaStreams,
    remoteMediaStreams
  )
  const sortedTiles = [...tiles].sort((left, right) => {
    if (left.id === pinnedTileId) return -1
    if (right.id === pinnedTileId) return 1
    if (left.kind === 'screen' && right.kind !== 'screen') return -1
    if (right.kind === 'screen' && left.kind !== 'screen') return 1
    if (left.local !== right.local) return left.local ? -1 : 1
    return left.participant.displayName.localeCompare(right.participant.displayName)
  })

  return (
    <div className="grid min-h-0 gap-3">
      <ScrollArea className="min-h-0 rounded-[2rem] bg-slate-950 p-2 shadow-xl shadow-black/10">
        <div className="grid auto-rows-fr gap-2 md:grid-cols-2 xl:grid-cols-3">
          {sortedTiles.map((tile) => (
            <ParticipantTile
              key={tile.id}
              pinned={tile.id === pinnedTileId}
              speaking={speakingParticipantIds.includes(tile.participant.id)}
              t={t}
              tile={tile}
              onPin={() => onPin(tile.id)}
            />
          ))}
        </div>
      </ScrollArea>

      <div className="contents">
        {participants.map((participant) => {
          const mediaStreams =
            participant.id === localParticipantId
              ? localMediaStreams
              : (remoteMediaStreams[participant.id] ?? {})
          const audioStream = mediaStreams.audio ?? null
          const screenAudioStream = mediaStreams.screenAudio ?? null
          const audioOn = slotEnabled(participant, 'audio')
          const screenAudioOn = slotEnabled(participant, 'screenAudio')

          if (participant.id === localParticipantId) {
            return null
          }

          return (
            <Fragment key={`${participant.id}:audio-slots`}>
              {audioOn && audioStream && (
                <ParticipantAudio key={`${participant.id}:audio`} stream={audioStream} />
              )}
              {screenAudioOn && screenAudioStream && (
                <ParticipantAudio
                  key={`${participant.id}:screenAudio`}
                  stream={screenAudioStream}
                />
              )}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
