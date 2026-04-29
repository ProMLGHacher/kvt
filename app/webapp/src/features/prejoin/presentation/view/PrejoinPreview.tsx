import type { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { VideoAspectRatio } from '@core/design-system'
import { useAttachMediaStream } from '@core/react/useAttachMediaStream'

export interface PrejoinPreviewProps {
  readonly cameraEnabled: boolean
  readonly displayName: string
  readonly previewRef: RefObject<HTMLVideoElement | null>
  readonly stream: MediaStream | null
}

export function PrejoinPreview({
  cameraEnabled,
  displayName,
  previewRef,
  stream
}: PrejoinPreviewProps) {
  const { t } = useTranslation('voice')

  useAttachMediaStream(previewRef, stream)

  return (
    <div className="relative h-52 overflow-hidden rounded-3xl border border-border/70 bg-slate-950 shadow-lg sm:h-64 xl:h-[22rem]">
      {cameraEnabled ? (
        <VideoAspectRatio
          ref={previewRef}
          aria-label={t('prejoin.cameraPreview')}
          autoPlay
          muted
          playsInline
          className="h-full w-full rounded-none object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-white">
          <div className="grid size-20 place-items-center rounded-full bg-white/10 text-3xl font-medium leading-none sm:size-24 sm:text-4xl">
            {displayName.trim().slice(0, 1).toUpperCase() || 'K'}
          </div>
        </div>
      )}
    </div>
  )
}
