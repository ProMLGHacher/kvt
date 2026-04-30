import type { TFunction } from 'i18next'
import { Card, CardContent } from '@core/design-system'
import type { Participant } from '@features/room/domain/model/Participant'
import type { RoomPanel, RoomStatusMessageKey } from '../model/RoomState'
import type { ConferenceDiagnostics } from '../model/RoomDiagnostics'
import { CameraIcon, CameraOffIcon, CloseIcon, IconButton, MicIcon, MicOffIcon } from './room-icons'
import { slotEnabled } from './room-tile-model'
import { TechnicalPanel } from './TechnicalPanel'

type VoiceT = TFunction<'voice'>
type RoomPanelTitleKey =
  | 'room.panels.participants'
  | 'room.panels.roomInfo'
  | 'room.panels.techInfo'
  | 'room.panels.chat'

export interface RoomFloatingPanelProps {
  readonly roomId: string
  readonly status: string
  readonly participantCount: number
  readonly actionStatus: RoomStatusMessageKey
  readonly activePanel: RoomPanel | null
  readonly participants: readonly Participant[]
  readonly diagnostics: ConferenceDiagnostics | null
  readonly onClose: () => void
  readonly onExportLogs: () => void
  readonly onClearLogs: () => void
  readonly t: VoiceT
}

export function RoomFloatingPanel({
  roomId,
  status,
  participantCount,
  actionStatus,
  activePanel,
  participants,
  diagnostics,
  onClose,
  onExportLogs,
  onClearLogs,
  t
}: RoomFloatingPanelProps) {
  if (!activePanel) {
    return null
  }

  return (
    <div className="pointer-events-none fixed bottom-24 right-3 z-20 w-[calc(100vw-1.5rem)] max-w-sm sm:right-4 md:bottom-24">
      <Card className="pointer-events-auto animate-panel-in max-h-[min(34rem,calc(100dvh-7rem))] overflow-hidden rounded-[1.75rem] border-white/10 bg-slate-950/92 text-white shadow-2xl shadow-black/30 backdrop-blur-xl">
        <CardContent className="grid max-h-[inherit] gap-4 overflow-y-auto p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">{t(panelTitle(activePanel))}</h2>
              <p className="mt-1 text-sm text-slate-300">{t(actionStatus)}</p>
            </div>
            <IconButton label={t('room.panels.close')} onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </div>

          {activePanel === 'participants' && (
            <ParticipantsPanel participants={participants} t={t} />
          )}
          {activePanel === 'roomInfo' && (
            <RoomInfoPanel
              participantCount={participantCount}
              roomId={roomId}
              status={status}
              t={t}
            />
          )}
          {activePanel === 'techInfo' && (
            <TechnicalPanel
              diagnostics={diagnostics}
              onClearLogs={onClearLogs}
              onExportLogs={onExportLogs}
              t={t}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function panelTitle(panel: RoomPanel): RoomPanelTitleKey {
  switch (panel) {
    case 'participants':
      return 'room.panels.participants'
    case 'roomInfo':
      return 'room.panels.roomInfo'
    case 'techInfo':
      return 'room.panels.techInfo'
    case 'chat':
      return 'room.panels.chat'
  }
}

function ParticipantsPanel({
  participants,
  t
}: {
  readonly participants: readonly Participant[]
  readonly t: VoiceT
}) {
  return (
    <div className="grid gap-2">
      {participants.map((participant) => {
        const micOn = slotEnabled(participant, 'audio')
        const cameraOn = slotEnabled(participant, 'camera')

        return (
          <div
            key={participant.id}
            className="flex items-center gap-3 rounded-2xl bg-white/8 px-3 py-2"
          >
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-white/12 text-sm font-semibold">
              {participant.displayName.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{participant.displayName}</p>
              <p className="truncate text-xs text-slate-400">
                {t(`room.participant.roles.${participant.role}`)}
              </p>
            </div>
            <div className="flex items-center gap-1 text-slate-300">
              {micOn ? <MicIcon /> : <MicOffIcon />}
              {cameraOn ? <CameraIcon /> : <CameraOffIcon />}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function RoomInfoPanel({
  roomId,
  status,
  participantCount,
  t
}: {
  readonly roomId: string
  readonly status: string
  readonly participantCount: number
  readonly t: VoiceT
}) {
  return (
    <div className="grid gap-3">
      <InfoRow label={t('room.info.roomId')} value={roomId} />
      <InfoRow label={t('room.info.status')} value={status} />
      <InfoRow
        label={t('room.info.participants')}
        value={t('room.header.participants', { count: participantCount })}
      />
    </div>
  )
}

function InfoRow({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-2xl bg-white/8 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-white">{value}</p>
    </div>
  )
}
