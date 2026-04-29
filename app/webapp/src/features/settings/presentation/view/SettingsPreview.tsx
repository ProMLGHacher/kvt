import type { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { VideoAspectRatio } from '@core/design-system'
import { useAttachMediaStream } from '@core/react/useAttachMediaStream'

export interface SettingsPreviewProps {
  readonly cameraEnabled: boolean
  readonly previewAvailable: boolean
  readonly previewRef: RefObject<HTMLVideoElement | null>
  readonly stream: MediaStream | null
}

export function SettingsPreview({
  cameraEnabled,
  previewAvailable,
  previewRef,
  stream
}: SettingsPreviewProps) {
  const { t } = useTranslation('common')

  useAttachMediaStream(previewRef, stream)

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-slate-950">
      {cameraEnabled && previewAvailable ? (
        <VideoAspectRatio
          ref={previewRef}
          autoPlay
          muted
          playsInline
          className="h-full min-h-56 w-full object-cover"
        />
      ) : (
        <div className="grid min-h-56 place-items-center p-6 text-center text-white">
          <div>
            <div className="mx-auto grid size-20 place-items-center rounded-full bg-white/12 text-3xl font-semibold">
              K
            </div>
            <p className="mt-4 text-sm text-slate-300">{t('settings.media.previewOff')}</p>
          </div>
        </div>
      )}
    </div>
  )
}
