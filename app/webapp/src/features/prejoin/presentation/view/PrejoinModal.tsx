import { useEffect, useRef, type ReactNode } from 'react'
import { useSharedFlow, useStateFlow, useViewModel, type PropsWithVM } from '@kvt/react'
import { useTranslation } from 'react-i18next'
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  Field,
  FieldHint,
  Input,
  Label,
  NativeSelect,
  Switch,
  useToast,
  VideoAspectRatio
} from '@core/design-system'
import type { ParticipantRole } from '@features/room/domain/model/Participant'
import { useAttachMediaStream } from '@core/react/useAttachMediaStream'
import { PrejoinViewModel } from '../view_model/PrejoinViewModel'

export interface PrejoinModalProps {
  readonly open: boolean
  readonly roomId: string
  readonly role?: ParticipantRole
  readonly onJoined: () => void
}

export function PrejoinModal({
  _vm = PrejoinViewModel,
  open,
  roomId,
  role = 'participant',
  onJoined
}: PropsWithVM<PrejoinViewModel, PrejoinModalProps>): ReactNode {
  const viewModel = useViewModel(_vm, { key: `prejoin:${roomId}` })
  const uiState = useStateFlow(viewModel.uiState)
  const previewRef = useRef<HTMLVideoElement | null>(null)
  const { t } = useTranslation('voice')
  const toasts = useToast()
  const microphones = uiState.devices.filter((device) => device.kind === 'audio-input')
  const cameras = uiState.devices.filter((device) => device.kind === 'video-input')

  useEffect(() => {
    viewModel.onEvent({ type: 'room-configured', roomId, role })
  }, [role, roomId, viewModel])

  useSharedFlow(viewModel.uiEffect, (effect) => {
    switch (effect.type) {
      case 'joined':
        onJoined()
        break
      case 'load-failed':
      case 'join-failed':
      case 'preview-failed':
        toasts.error(t(effect.message))
        break
    }
  })

  useAttachMediaStream(previewRef, uiState.preview?.stream ?? null)

  return (
    <Dialog
      className="max-h-[calc(100dvh-0.75rem)] max-w-6xl overflow-hidden rounded-4xl p-0 sm:max-h-[calc(100dvh-2rem)]"
      open={open}
    >
      <div className="flex max-h-[calc(100dvh-0.75rem)] flex-col overflow-y-auto bg-surface-elevated sm:max-h-[calc(100dvh-2rem)] xl:grid xl:grid-cols-[minmax(0,1fr)_22rem] xl:overflow-hidden">
        <section className="flex min-h-0 flex-col border-b border-border/80 bg-background xl:border-b-0 xl:border-r">
          <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default">{t('prejoin.badge')}</Badge>
                <Badge className="truncate">{uiState.roomId}</Badge>
              </div>
              <h2 className="mt-3 text-xl font-medium text-foreground sm:text-2xl">
                {t('prejoin.title')}
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                {t('prejoin.description')}
              </p>
            </div>
          </div>

          <div className="grid gap-4 px-4 pb-4 sm:px-6 sm:pb-6 lg:gap-5">
            <div className="overflow-hidden rounded-4xl border border-border/70 bg-slate-950 shadow-lg">
              {uiState.cameraEnabled ? (
                <VideoAspectRatio
                  ref={previewRef}
                  aria-label={t('prejoin.cameraPreview')}
                  autoPlay
                  muted
                  playsInline
                  className="aspect-[16/12] w-full rounded-none object-cover sm:aspect-[16/10] xl:aspect-[16/9]"
                />
              ) : (
                <div className="grid aspect-[16/12] place-items-center p-8 text-center text-white sm:aspect-[16/10] xl:aspect-[16/9]">
                  <div>
                    <div className="mx-auto grid size-20 place-items-center rounded-full bg-white/10 text-3xl font-medium sm:size-24 sm:text-4xl">
                      {uiState.displayName.value.trim().slice(0, 1).toUpperCase() || 'K'}
                    </div>
                    <p className="mt-4 text-sm text-slate-300">{t('prejoin.cameraOff')}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <ToggleSummaryCard
                checked={uiState.micEnabled}
                description={uiState.micEnabled ? t('prejoin.micOn') : t('prejoin.micOff')}
                label={t('prejoin.microphone')}
                onChange={(enabled) => viewModel.onEvent({ type: 'microphone-toggled', enabled })}
              />
              <ToggleSummaryCard
                checked={uiState.cameraEnabled}
                description={
                  uiState.cameraEnabled ? t('prejoin.cameraOn') : t('prejoin.cameraOffShort')
                }
                label={t('prejoin.camera')}
                onChange={(enabled) => viewModel.onEvent({ type: 'camera-toggled', enabled })}
              />
            </div>
          </div>
        </section>

        <section className="flex min-h-0 flex-col bg-surface">
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
            <div className="grid gap-4">
              {uiState.error && (
                <Alert>
                  <AlertDescription>{t(uiState.error)}</AlertDescription>
                </Alert>
              )}

              <Field>
                <Label htmlFor="display-name">{t('prejoin.nameLabel')}</Label>
                <Input
                  id="display-name"
                  autoFocus
                  className="min-h-12 rounded-3xl px-4"
                  placeholder={t('prejoin.namePlaceholder')}
                  value={uiState.displayName.value}
                  onChange={(event) =>
                    viewModel.onEvent({ type: 'display-name-changed', value: event.target.value })
                  }
                />
                {uiState.displayName.showError && (
                  <FieldHint className="text-destructive">
                    {uiState.displayName.error ? t(uiState.displayName.error) : ''}
                  </FieldHint>
                )}
              </Field>

              <Field>
                <Label htmlFor="microphone">{t('prejoin.microphone')}</Label>
                <NativeSelect
                  id="microphone"
                  className="min-h-12 rounded-3xl px-4"
                  value={uiState.selectedMicrophoneId ?? ''}
                  onChange={(event) =>
                    viewModel.onEvent({
                      type: 'microphone-selected',
                      deviceId: event.target.value || null
                    })
                  }
                >
                  <option value="">{t('prejoin.defaultDevice')}</option>
                  {microphones.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.label}
                    </option>
                  ))}
                </NativeSelect>
              </Field>

              <Field>
                <Label htmlFor="camera">{t('prejoin.camera')}</Label>
                <NativeSelect
                  id="camera"
                  className="min-h-12 rounded-3xl px-4"
                  value={uiState.selectedCameraId ?? ''}
                  onChange={(event) =>
                    viewModel.onEvent({
                      type: 'camera-selected',
                      deviceId: event.target.value || null
                    })
                  }
                >
                  <option value="">{t('prejoin.defaultDevice')}</option>
                  {cameras.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.label}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
            </div>
          </div>

          <div className="border-t border-border/80 bg-surface px-4 py-4 sm:px-5">
            <Button
              className="min-h-12 w-full rounded-full"
              disabled={!uiState.joinButton.enabled || uiState.joinButton.loading}
              onClick={() => viewModel.onEvent({ type: 'join-pressed' })}
              type="button"
            >
              {uiState.joinButton.loading ? t('prejoin.joining') : t('prejoin.joinRoom')}
            </Button>
          </div>
        </section>
      </div>
    </Dialog>
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
    <Card className="rounded-4xl border-border/80">
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
        <Switch checked={checked} onCheckedChange={onChange} />
      </CardContent>
    </Card>
  )
}
