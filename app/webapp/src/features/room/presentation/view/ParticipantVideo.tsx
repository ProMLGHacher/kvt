import { memo, useRef } from 'react'
import { cn } from '@core/design-system'
import { useAttachMediaStream } from '@core/react/useAttachMediaStream'

export const ParticipantVideo = memo(function ParticipantVideo({
  stream,
  muted,
  variant
}: {
  readonly stream: MediaStream
  readonly muted: boolean
  readonly variant: 'participant' | 'screen'
}) {
  const ref = useRef<HTMLVideoElement | null>(null)
  const backgroundRef = useRef<HTMLVideoElement | null>(null)
  useAttachMediaStream(ref, stream)
  useAttachMediaStream(backgroundRef, stream)

  return (
    <div className="absolute inset-0 z-0 grid place-items-center overflow-hidden bg-slate-950">
      <video
        autoPlay
        className={cn(
          'absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-2xl',
          variant === 'screen' ? 'opacity-20 saturate-100' : 'opacity-55 saturate-125'
        )}
        muted
        playsInline
        ref={backgroundRef}
      />
      <div
        className={cn(
          'absolute inset-0',
          variant === 'screen'
            ? 'bg-black/20'
            : 'bg-linear-to-br from-slate-950/35 via-transparent to-slate-950/45'
        )}
      />
      <video
        autoPlay
        className={cn(
          'relative h-full w-full object-contain object-center',
          variant === 'screen' && 'p-2 sm:p-3'
        )}
        muted={muted}
        playsInline
        ref={ref}
      />
    </div>
  )
})
