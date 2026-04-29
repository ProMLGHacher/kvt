import { memo, useRef } from 'react'
import { useAttachMediaStream } from '@core/react/useAttachMediaStream'

export const ParticipantAudio = memo(function ParticipantAudio({
  stream
}: {
  readonly stream: MediaStream
}) {
  const ref = useRef<HTMLAudioElement | null>(null)
  useAttachMediaStream(ref, stream)

  return <audio autoPlay ref={ref} />
})
