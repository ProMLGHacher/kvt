import type { TFunction } from 'i18next'
import { Switch } from '@core/design-system'

type VoiceT = TFunction<'voice'>

export interface PrejoinControlsProps {
  readonly cameraEnabled: boolean
  readonly micEnabled: boolean
  readonly onCameraChange: (enabled: boolean) => void
  readonly onMicrophoneChange: (enabled: boolean) => void
  readonly t: VoiceT
}

export function PrejoinControls({
  cameraEnabled,
  micEnabled,
  onCameraChange,
  onMicrophoneChange,
  t
}: PrejoinControlsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <ToggleSummaryCard
        checked={micEnabled}
        description={micEnabled ? t('prejoin.micOn') : t('prejoin.micOff')}
        label={t('prejoin.microphone')}
        onChange={onMicrophoneChange}
      />
      <ToggleSummaryCard
        checked={cameraEnabled}
        description={cameraEnabled ? t('prejoin.cameraOn') : t('prejoin.cameraOffShort')}
        label={t('prejoin.camera')}
        onChange={onCameraChange}
      />
    </div>
  )
}

function ToggleSummaryCard({
  checked,
  label,
  description,
  onChange
}: {
  readonly checked: boolean
  readonly label: string
  readonly description: string
  readonly onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl border border-border/80 bg-transparent p-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
