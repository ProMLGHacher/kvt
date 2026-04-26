import { memo, useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useSharedFlow, useStateFlow, useViewModel, type PropsWithVM } from '@kvt/react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  Empty,
  ScrollArea,
  Switch,
  cn,
  useToast
} from '@core/design-system'
import type { RtcMediaStreams } from '@capabilities/rtc/domain/model'
import type { Participant, ParticipantSlotKind } from '@features/room/domain/model/Participant'
import { PrejoinModal } from '@features/prejoin/presentation/view/PrejoinModal'
import { useAttachMediaStream } from '@core/react/useAttachMediaStream'
import type { RoomStatusMessageKey } from '../model/RoomState'
import { RoomViewModel } from '../view_model/RoomViewModel'

type VoiceT = TFunction<'voice'>
type RoomTileKind = 'presence' | 'camera' | 'screen'

type ParticipantMediaTile = {
  readonly id: string
  readonly participant: Participant
  readonly kind: RoomTileKind
  readonly stream: MediaStream | null
  readonly local: boolean
  readonly audioOn: boolean
  readonly cameraOn: boolean
  readonly screenOn: boolean
  readonly awaitingMedia: boolean
}

export function RoomPage({ _vm = RoomViewModel }: PropsWithVM<RoomViewModel>): ReactNode {
  const { roomId = '' } = useParams()
  const navigate = useNavigate()
  const viewModel = useViewModel(_vm, { key: `room:${roomId}` })
  const uiState = useStateFlow(viewModel.uiState)
  const toasts = useToast()
  const { t } = useTranslation('voice')
  useEffect(() => {
    viewModel.onEvent({ type: 'room-opened', roomId })
  }, [roomId, viewModel])

  useSharedFlow(viewModel.uiEffect, (effect) => {
    switch (effect.type) {
      case 'navigate-home':
        void navigate('/')
        break
      case 'show-toast':
        toasts.toast(t(effect.message))
        break
      case 'download-logs':
        downloadTextFile(effect.fileName, effect.content)
        toasts.info(t('room.toasts.logsConsole'))
        break
    }
  })

  return (
    <section className="mx-auto flex min-h-[calc(100vh-4.5rem)] w-full max-w-[96rem] flex-col gap-3 px-3 py-3 sm:px-4 md:px-6">
      <RoomTopBar
        actionStatus={uiState.actionStatus}
        participantCount={uiState.participants.length}
        roomId={uiState.roomId}
        status={uiState.status}
        technicalInfoVisible={uiState.technicalInfoVisible}
        onCopy={() => viewModel.onEvent({ type: 'copy-link-pressed' })}
        onLeave={() => viewModel.onEvent({ type: 'leave-pressed' })}
        onTechnicalInfoChange={(visible) =>
          viewModel.onEvent({ type: 'technical-info-toggled', visible })
        }
      />

      {uiState.error ? (
        <RoomErrorState
          actionLabel={t(uiState.error.actionLabel)}
          description={t(uiState.error.description)}
          title={t(uiState.error.title)}
          onAction={() => viewModel.onEvent({ type: 'go-home-pressed' })}
        />
      ) : (
        <>
          <div
            className={cn(
              'grid min-h-0 flex-1 gap-3',
              uiState.technicalInfoVisible ? '2xl:grid-cols-[minmax(0,1fr)_22rem]' : 'grid-cols-1'
            )}
          >
            <ConferenceStage
              key={`stage:${roomId}`}
              localMediaStreams={uiState.localMediaStreams}
              localParticipantId={uiState.localParticipantId}
              participants={uiState.participants}
              remoteMediaStreams={uiState.remoteMediaStreams}
              t={t}
            />

            {uiState.technicalInfoVisible && (
              <TechnicalPanel
                diagnostics={uiState.diagnostics}
                onClearLogs={() => viewModel.onEvent({ type: 'clear-logs-pressed' })}
                onExportLogs={() => viewModel.onEvent({ type: 'export-logs-pressed' })}
                t={t}
              />
            )}
          </div>

          <BottomDock
            key={`dock:${roomId}`}
            cameraEnabled={uiState.camera.enabled}
            microphoneEnabled={uiState.microphone.enabled}
            screenEnabled={uiState.screenShare.enabled}
            onCamera={() => viewModel.onEvent({ type: 'camera-toggled' })}
            onMicrophone={() => viewModel.onEvent({ type: 'microphone-toggled' })}
            onScreen={() => viewModel.onEvent({ type: 'screen-share-toggled' })}
            t={t}
          />
        </>
      )}

      <PrejoinModal
        open={uiState.prejoinOpen && Boolean(uiState.roomId)}
        roomId={uiState.roomId}
        role="host"
        onJoined={() => viewModel.onEvent({ type: 'prejoin-completed' })}
      />
    </section>
  )
}

function RoomTopBar({
  roomId,
  status,
  participantCount,
  actionStatus,
  technicalInfoVisible,
  onCopy,
  onLeave,
  onTechnicalInfoChange
}: {
  readonly roomId: string
  readonly status: string
  readonly participantCount: number
  readonly actionStatus: RoomStatusMessageKey
  readonly technicalInfoVisible: boolean
  readonly onCopy: () => void
  readonly onLeave: () => void
  readonly onTechnicalInfoChange: (visible: boolean) => void
}) {
  const { t } = useTranslation('voice')

  return (
    <Card className="rounded-4xl border-border/80 bg-surface">
      <CardContent className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={status === 'connected' ? 'success' : 'default'}>{status}</Badge>
            <Badge>{t('room.header.participants', { count: participantCount })}</Badge>
            <Badge className="truncate">{roomId}</Badge>
          </div>
          <h1 className="mt-3 text-lg font-medium text-foreground sm:text-xl">
            {t('room.header.title', { roomId })}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t(actionStatus)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-3 rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground">
            <Switch checked={technicalInfoVisible} onCheckedChange={onTechnicalInfoChange} />
            {t('room.header.techInfo')}
          </label>
          <Button className="rounded-full px-5" onClick={onCopy} type="button" variant="outline">
            {t('room.header.copyLink')}
          </Button>
          <Button
            className="rounded-full px-5"
            onClick={onLeave}
            type="button"
            variant="destructive"
          >
            {t('room.header.leave')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ConferenceStage({
  participants,
  localParticipantId,
  localMediaStreams,
  remoteMediaStreams,
  t
}: {
  readonly participants: readonly Participant[]
  readonly localParticipantId: string | null
  readonly localMediaStreams: RtcMediaStreams
  readonly remoteMediaStreams: Readonly<Record<string, RtcMediaStreams>>
  readonly t: VoiceT
}) {
  const [pinnedTileId, setPinnedTileId] = useState<string | null>(null)

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
      <ScrollArea className="min-h-0 rounded-4xl">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sortedTiles.map((tile) => (
            <ParticipantTile
              key={tile.id}
              pinned={tile.id === pinnedTileId}
              t={t}
              tile={tile}
              onPin={() => setPinnedTileId(tile.id === pinnedTileId ? null : tile.id)}
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
          const audioOn = slotEnabled(participant, 'audio')

          if (!audioOn || !audioStream || participant.id === localParticipantId) {
            return null
          }

          return <ParticipantAudio key={`${participant.id}:audio`} stream={audioStream} />
        })}
      </div>
    </div>
  )
}

function ParticipantTile({
  tile,
  pinned,
  onPin,
  t
}: {
  readonly tile: ParticipantMediaTile
  readonly pinned: boolean
  readonly onPin: () => void
  readonly t: VoiceT
}) {
  const fullscreenRef = useRef<HTMLDivElement | null>(null)
  const title =
    tile.kind === 'screen'
      ? t('room.participant.screenFrom', { name: tile.participant.displayName })
      : tile.participant.displayName

  return (
    <Card
      className={cn(
        'overflow-hidden rounded-4xl border-border bg-slate-950 text-white',
        pinned && 'md:col-span-2 xl:col-span-2'
      )}
    >
      <div
        ref={fullscreenRef}
        className={cn(
          'relative overflow-hidden bg-slate-950',
          tile.kind === 'screen'
            ? pinned
              ? 'aspect-[16/9] min-h-[22rem]'
              : 'aspect-[16/10]'
            : pinned
              ? 'aspect-[16/9] min-h-[20rem]'
              : 'aspect-video',
          tile.kind === 'presence' && 'min-h-[15rem]'
        )}
      >
        {tile.stream ? (
          <ParticipantVideo
            muted={tile.local}
            objectFit={tile.kind === 'screen' ? 'contain' : 'cover'}
            stream={tile.stream}
          />
        ) : (
          <div className="grid h-full place-items-center p-6 text-center">
            <div>
              <div className="mx-auto grid size-20 place-items-center rounded-full bg-white/10 text-3xl font-medium sm:size-24 sm:text-4xl">
                {tile.participant.displayName.slice(0, 1).toUpperCase()}
              </div>
              {tile.awaitingMedia && (
                <p className="mt-4 max-w-64 text-sm leading-6 text-slate-300">
                  {t('room.participant.waitingMedia')}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-28 bg-linear-to-t from-slate-950/85 to-transparent" />
        <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {tile.local && <Badge variant="info">{t('room.participant.you')}</Badge>}
            {tile.kind === 'screen' && (
              <Badge variant="warning">{t('room.participant.screen')}</Badge>
            )}
            {pinned && <Badge variant="success">{t('room.participant.pinned')}</Badge>}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              className="rounded-full bg-black/35 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-black/50"
              onClick={onPin}
              type="button"
            >
              {pinned ? t('room.participant.unpin') : t('room.participant.pin')}
            </button>
            {tile.kind === 'screen' && (
              <button
                className="rounded-full bg-black/35 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-black/50"
                onClick={() => {
                  void fullscreenRef.current?.requestFullscreen?.()
                }}
                type="button"
              >
                {t('room.participant.fullscreen')}
              </button>
            )}
          </div>
        </div>

        <div className="absolute left-3 right-3 top-14 flex flex-wrap gap-1">
          <Pill enabled={tile.audioOn} label={t('room.participant.mic')} />
          <Pill enabled={tile.cameraOn} label={t('room.participant.cam')} />
          {tile.screenOn && <Pill enabled label={t('room.participant.screen')} />}
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <p className="truncate text-base font-medium">{title}</p>
          <p className="truncate text-xs text-slate-300">
            {t(`room.participant.roles.${tile.participant.role}`)}
          </p>
        </div>
      </div>
    </Card>
  )
}

const ParticipantVideo = memo(function ParticipantVideo({
  stream,
  muted,
  objectFit
}: {
  readonly stream: MediaStream
  readonly muted: boolean
  readonly objectFit: 'cover' | 'contain'
}) {
  const ref = useRef<HTMLVideoElement | null>(null)
  useAttachMediaStream(ref, stream)

  return (
    <video
      autoPlay
      className={cn(
        'h-full w-full bg-slate-950',
        objectFit === 'contain' ? 'object-contain' : 'object-cover'
      )}
      muted={muted}
      playsInline
      ref={ref}
    />
  )
})

const ParticipantAudio = memo(function ParticipantAudio({
  stream
}: {
  readonly stream: MediaStream
}) {
  const ref = useRef<HTMLAudioElement | null>(null)
  useAttachMediaStream(ref, stream)

  return <audio autoPlay ref={ref} />
})

function Pill({ enabled, label }: { readonly enabled: boolean; readonly label: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium',
        enabled ? 'bg-white/14 text-white' : 'bg-black/35 text-slate-300'
      )}
    >
      {label}
    </span>
  )
}

function BottomDock({
  microphoneEnabled,
  cameraEnabled,
  screenEnabled,
  onMicrophone,
  onCamera,
  onScreen,
  t
}: {
  readonly microphoneEnabled: boolean
  readonly cameraEnabled: boolean
  readonly screenEnabled: boolean
  readonly onMicrophone: () => void
  readonly onCamera: () => void
  readonly onScreen: () => void
  readonly t: VoiceT
}) {
  const [collapsed, setCollapsed] = useState(false)
  const touchStartY = useRef<number | null>(null)

  return (
    <div
      className="sticky bottom-3 z-20 flex justify-center"
      onTouchEnd={(event) => {
        if (touchStartY.current === null) {
          return
        }

        const delta = event.changedTouches[0].clientY - touchStartY.current
        if (delta > 48) {
          setCollapsed(true)
        } else if (delta < -48) {
          setCollapsed(false)
        }
        touchStartY.current = null
      }}
      onTouchStart={(event) => {
        touchStartY.current = event.touches[0]?.clientY ?? null
      }}
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-2 md:max-w-none">
        <button
          className="inline-flex min-h-10 items-center rounded-full border border-border/80 bg-surface px-4 text-sm font-medium text-foreground shadow-sm md:hidden"
          onClick={() => setCollapsed(!collapsed)}
          type="button"
        >
          {collapsed ? t('room.controls.expandPanel') : t('room.controls.collapsePanel')}
        </button>

        <Card
          className={cn(
            'rounded-4xl border-border/80 bg-surface shadow-md transition md:block',
            collapsed ? 'hidden' : 'block'
          )}
        >
          <CardContent className="grid grid-cols-1 gap-2 p-2 sm:grid-cols-3">
            <DockButton
              active={microphoneEnabled}
              label={microphoneEnabled ? t('room.controls.mute') : t('room.controls.unmute')}
              onClick={onMicrophone}
            />
            <DockButton
              active={cameraEnabled}
              label={cameraEnabled ? t('room.controls.cameraOff') : t('room.controls.cameraOn')}
              onClick={onCamera}
            />
            <DockButton
              active={screenEnabled}
              label={screenEnabled ? t('room.controls.stopShare') : t('room.controls.shareScreen')}
              onClick={onScreen}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function DockButton({
  active,
  label,
  onClick
}: {
  readonly active: boolean
  readonly label: string
  readonly onClick: () => void
}) {
  return (
    <button
      className={cn(
        'inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-medium transition',
        active
          ? 'bg-muted text-foreground hover:bg-muted/80'
          : 'bg-destructive text-on-feedback hover:opacity-90'
      )}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  )
}

function TechnicalPanel({
  diagnostics,
  onExportLogs,
  onClearLogs,
  t
}: {
  readonly diagnostics: {
    readonly room: readonly string[]
    readonly publisher: readonly string[]
    readonly subscriber: readonly string[]
    readonly signaling: readonly string[]
  } | null
  readonly onExportLogs: () => void
  readonly onClearLogs: () => void
  readonly t: VoiceT
}) {
  return (
    <Card className="min-h-0 rounded-4xl border-border/80 bg-surface">
      <CardContent className="grid h-full gap-4 p-4">
        <div>
          <h2 className="text-lg font-medium text-foreground">{t('room.tech.title')}</h2>
        </div>

        {diagnostics ? (
          <div className="grid gap-3">
            <DiagnosticGroup title={t('room.tech.room')} values={diagnostics.room} />
            <DiagnosticGroup title={t('room.tech.publisher')} values={diagnostics.publisher} />
            <DiagnosticGroup title={t('room.tech.subscriber')} values={diagnostics.subscriber} />
            <DiagnosticGroup title={t('room.tech.signaling')} values={diagnostics.signaling} />
          </div>
        ) : (
          <Alert>
            <AlertDescription>{t('room.tech.noDiagnostics')}</AlertDescription>
          </Alert>
        )}

        <div className="mt-auto grid gap-2">
          <Button className="rounded-full" onClick={onExportLogs} type="button" variant="outline">
            {t('room.tech.export')}
          </Button>
          <Button className="rounded-full" onClick={onClearLogs} type="button" variant="ghost">
            {t('room.tech.clear')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function DiagnosticGroup({
  title,
  values
}: {
  readonly title: string
  readonly values: readonly string[]
}) {
  return (
    <div className="rounded-3xl border border-border bg-background p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
      <ul className="mt-2 grid gap-1 text-xs text-muted-foreground">
        {values.map((value) => (
          <li key={value}>{value}</li>
        ))}
      </ul>
    </div>
  )
}

function RoomErrorState({
  title,
  description,
  actionLabel,
  onAction
}: {
  readonly title: string
  readonly description: string
  readonly actionLabel: string
  readonly onAction: () => void
}) {
  return (
    <Card className="grid min-h-[28rem] place-items-center rounded-4xl">
      <CardContent className="max-w-xl p-6 text-center sm:p-8">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-muted text-2xl font-medium text-muted-foreground">
          !
        </div>
        <h2 className="mt-5 text-2xl font-medium text-foreground sm:text-3xl">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>
        <Button className="mt-6 rounded-full px-6" onClick={onAction} type="button">
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  )
}

function buildParticipantTiles(
  participants: readonly Participant[],
  localParticipantId: string | null,
  localMediaStreams: RtcMediaStreams,
  remoteMediaStreams: Readonly<Record<string, RtcMediaStreams>>
): ParticipantMediaTile[] {
  const tiles: ParticipantMediaTile[] = []

  for (const participant of participants) {
    const local = participant.id === localParticipantId
    const mediaStreams = local ? localMediaStreams : (remoteMediaStreams[participant.id] ?? {})
    const audioOn = slotEnabled(participant, 'audio')
    const cameraOn = slotEnabled(participant, 'camera')
    const screenOn = slotEnabled(participant, 'screen')
    const cameraStream = mediaStreams.camera ?? null
    const screenStream = mediaStreams.screen ?? null

    if (cameraOn || cameraStream) {
      tiles.push({
        id: `${participant.id}:camera`,
        participant,
        kind: 'camera',
        stream: cameraStream,
        local,
        audioOn,
        cameraOn,
        screenOn,
        awaitingMedia: cameraOn && !cameraStream
      })
    }

    if (screenOn || screenStream) {
      tiles.push({
        id: `${participant.id}:screen`,
        participant,
        kind: 'screen',
        stream: screenStream,
        local,
        audioOn,
        cameraOn,
        screenOn,
        awaitingMedia: screenOn && !screenStream
      })
    }

    if (!cameraOn && !screenOn && !cameraStream && !screenStream) {
      tiles.push({
        id: `${participant.id}:presence`,
        participant,
        kind: 'presence',
        stream: null,
        local,
        audioOn,
        cameraOn,
        screenOn,
        awaitingMedia: audioOn
      })
    }
  }

  return tiles
}

function slotEnabled(participant: Participant, kind: ParticipantSlotKind): boolean {
  return participant.slots.some((slot) => slot.kind === kind && slot.enabled && slot.publishing)
}

function downloadTextFile(fileName: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
