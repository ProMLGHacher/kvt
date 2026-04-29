import { useRef, type ReactNode } from 'react'
import type { TFunction } from 'i18next'
import { Badge, Card, cn } from '@core/design-system'
import type { ParticipantMediaTile } from './room-tile-model'
import { CameraIcon, CameraOffIcon, MicIcon, MicOffIcon, ScreenIcon } from './room-icons'
import { ParticipantVideo } from './ParticipantVideo'

type VoiceT = TFunction<'voice'>

export interface ParticipantTileProps {
  readonly tile: ParticipantMediaTile
  readonly speaking: boolean
  readonly pinned: boolean
  readonly onPin: () => void
  readonly t: VoiceT
}

export function ParticipantTile({ tile, speaking, pinned, onPin, t }: ParticipantTileProps) {
  const fullscreenRef = useRef<HTMLDivElement | null>(null)
  const title =
    tile.kind === 'screen'
      ? t('room.participant.screenFrom', { name: tile.participant.displayName })
      : tile.participant.displayName

  return (
    <Card
      className={cn(
        'overflow-hidden rounded-[1.75rem] bg-slate-950 text-white shadow-none transition-all duration-300',
        tile.kind === 'screen'
          ? 'border-white/15 bg-slate-950 ring-1 ring-info/25'
          : speaking
            ? 'border-primary/80 ring-2 ring-primary/45'
            : 'border-white/10',
        tile.kind !== 'screen' &&
          !tile.audioOn &&
          'border-destructive/45 ring-1 ring-destructive/20',
        pinned && 'md:col-span-2 xl:col-span-2'
      )}
    >
      <div
        ref={fullscreenRef}
        className={cn(
          'relative overflow-hidden bg-slate-950 transition-all duration-300',
          tile.kind === 'screen'
            ? pinned
              ? 'aspect-[16/9] min-h-[22rem]'
              : 'aspect-[16/9]'
            : pinned
              ? 'aspect-[16/9] min-h-[20rem]'
              : 'aspect-video',
          tile.kind === 'presence' && 'min-h-[15rem]',
          tile.kind === 'screen' && 'm-1 rounded-[1.45rem] border border-white/10 bg-black'
        )}
      >
        {tile.stream ? (
          <ParticipantVideo
            muted={tile.local}
            stream={tile.stream}
            variant={tile.kind === 'screen' ? 'screen' : 'participant'}
          />
        ) : (
          <div className="grid h-full place-items-center p-6 text-center">
            <div className="relative grid place-items-center">
              <div
                className={cn(
                  'absolute size-28 rounded-full border border-primary/45 bg-primary/15 opacity-0 sm:size-36',
                  speaking && 'speaking-ring'
                )}
              />
              <div
                className={cn(
                  'absolute size-36 rounded-full border border-info/35 bg-info/10 opacity-0 sm:size-44',
                  speaking && 'speaking-ring speaking-ring-delayed'
                )}
              />
              <div className="relative mx-auto grid size-20 place-items-center rounded-full bg-white/12 text-3xl font-semibold shadow-2xl shadow-black/25 ring-1 ring-white/15 transition-transform duration-300 sm:size-24 sm:text-4xl">
                <span className={cn('inline-block transition-transform', speaking && 'scale-105')}>
                  {tile.participant.displayName.slice(0, 1).toUpperCase()}
                </span>
              </div>
              {tile.awaitingMedia && (
                <p className="mt-4 max-w-64 text-sm leading-6 text-slate-300">
                  {t('room.participant.waitingMedia')}
                </p>
              )}
            </div>
          </div>
        )}

        {tile.kind === 'screen' && (
          <div className="pointer-events-none absolute inset-0 z-20 border-2 border-white/10" />
        )}
        {tile.kind !== 'screen' && !tile.audioOn && (
          <div className="pointer-events-none absolute inset-0 z-20 bg-destructive/10" />
        )}
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 z-20 h-28 bg-linear-to-t to-transparent',
            tile.kind === 'screen' ? 'from-slate-950/80' : 'from-slate-950/90'
          )}
        />
        <div className="absolute left-3 right-3 top-3 z-30 flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {tile.kind === 'screen' && (
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-black/20 backdrop-blur">
                <ScreenIcon />
                <span>{t('room.participant.screen')}</span>
              </div>
            )}
            {tile.local && <Badge variant="info">{t('room.participant.you')}</Badge>}
            {pinned && <Badge variant="success">{t('room.participant.pinned')}</Badge>}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              className="rounded-full bg-black/35 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-black/50"
              onClick={onPin}
              type="button"
            >
              {pinned ? t('room.participant.unpin') : t('room.participant.pin')}
            </button>
            {tile.kind === 'screen' && (
              <button
                className="rounded-full bg-black/35 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-black/50"
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

        <div className="absolute bottom-3 left-3 right-3 z-30 flex items-end justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            {tile.kind === 'screen' && (
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-black/45 text-white ring-1 ring-white/15">
                <ScreenIcon />
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-base font-medium">{title}</p>
              <p className="truncate text-xs text-slate-300">
                {t(`room.participant.roles.${tile.participant.role}`)}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <StatusDot enabled={tile.audioOn} label={t('room.participant.mic')}>
              {tile.audioOn ? <MicIcon /> : <MicOffIcon />}
            </StatusDot>
            <StatusDot enabled={tile.cameraOn} label={t('room.participant.cam')}>
              {tile.cameraOn ? <CameraIcon /> : <CameraOffIcon />}
            </StatusDot>
            {tile.screenOn && (
              <StatusDot enabled label={t('room.participant.screen')}>
                <ScreenIcon />
              </StatusDot>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

function StatusDot({
  children,
  enabled,
  label
}: {
  readonly children: ReactNode
  readonly enabled: boolean
  readonly label: string
}) {
  return (
    <span
      aria-label={label}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-full backdrop-blur',
        enabled ? 'bg-white/14 text-white' : 'bg-destructive/85 text-on-feedback'
      )}
      title={label}
    >
      {children}
    </span>
  )
}
