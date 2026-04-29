import type { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { Field, Label, NativeSelect, Switch } from '@core/design-system'
import type { MediaDevice } from '@capabilities/media/domain/model'
import { SettingsPreview } from './SettingsPreview'

export interface MediaSettingsProps {
  readonly cameraEnabled: boolean
  readonly cameras: readonly MediaDevice[]
  readonly microphones: readonly MediaDevice[]
  readonly micEnabled: boolean
  readonly previewAvailable: boolean
  readonly previewRef: RefObject<HTMLVideoElement | null>
  readonly previewStream: MediaStream | null
  readonly selectedCameraId: string | null
  readonly selectedMicrophoneId: string | null
  readonly onCameraChange: (enabled: boolean) => void
  readonly onCameraSelect: (deviceId: string | null) => void
  readonly onMicrophoneChange: (enabled: boolean) => void
  readonly onMicrophoneSelect: (deviceId: string | null) => void
}

export function MediaSettings({
  cameraEnabled,
  cameras,
  microphones,
  micEnabled,
  previewAvailable,
  previewRef,
  previewStream,
  selectedCameraId,
  selectedMicrophoneId,
  onCameraChange,
  onCameraSelect,
  onMicrophoneChange,
  onMicrophoneSelect
}: MediaSettingsProps) {
  const { t } = useTranslation('common')

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_19rem]">
      <div>
        <h3 className="text-2xl font-semibold text-foreground">{t('settings.media.title')}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t('settings.media.description')}
        </p>

        <div className="mt-5 grid gap-3">
          <ToggleRow
            checked={micEnabled}
            description={t('settings.media.micHint')}
            label={t('settings.media.microphone')}
            onChange={onMicrophoneChange}
          />
          <ToggleRow
            checked={cameraEnabled}
            description={t('settings.media.cameraHint')}
            label={t('settings.media.camera')}
            onChange={onCameraChange}
          />
          <Field>
            <Label htmlFor="settings-microphone">{t('settings.media.microphone')}</Label>
            <NativeSelect
              id="settings-microphone"
              className="min-h-12 rounded-3xl"
              value={selectedMicrophoneId ?? ''}
              onChange={(event) => onMicrophoneSelect(event.target.value || null)}
            >
              <option value="">{t('settings.media.defaultDevice')}</option>
              {microphones.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.label}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field>
            <Label htmlFor="settings-camera">{t('settings.media.camera')}</Label>
            <NativeSelect
              id="settings-camera"
              className="min-h-12 rounded-3xl"
              value={selectedCameraId ?? ''}
              onChange={(event) => onCameraSelect(event.target.value || null)}
            >
              <option value="">{t('settings.media.defaultDevice')}</option>
              {cameras.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.label}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>
      </div>

      <SettingsPreview
        cameraEnabled={cameraEnabled}
        previewAvailable={previewAvailable}
        previewRef={previewRef}
        stream={previewStream}
      />
    </div>
  )
}

function ToggleRow({
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
    <div className="flex items-center justify-between gap-4 rounded-3xl border border-border/80 bg-surface-overlay px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
