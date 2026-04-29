import { useEffect, useRef, type ReactNode } from 'react'
import { useKvtTheme } from '@kvt/theme'
import { useSharedFlow, useStateFlow, useViewModel, type PropsWithVM } from '@kvt/react'
import { useTranslation } from 'react-i18next'
import { Alert, AlertDescription, Button, Dialog, useToast } from '@core/design-system'
import { setLanguage } from '@core/i18n/config'
import { SettingsViewModel } from '../view_model/SettingsViewModel'
import { AppearanceSettings } from './AppearanceSettings'
import { AudioSettings } from './AudioSettings'
import { MediaSettings } from './MediaSettings'
import { ProfileSettings } from './ProfileSettings'
import { SettingsSidebar } from './SettingsSidebar'
import { CloseIcon } from './settings-icons'

export { SettingsIcon } from './settings-icons'

export interface SettingsModalProps {
  readonly open: boolean
  readonly onClose: () => void
  readonly viewModelKey?: string
}

export function SettingsModalHost(props: SettingsModalProps): ReactNode {
  return <SettingsModal {...props} />
}

export function SettingsModal({
  _vm = SettingsViewModel,
  open,
  onClose,
  viewModelKey
}: PropsWithVM<SettingsViewModel, SettingsModalProps>): ReactNode {
  const viewModel = useViewModel(_vm, viewModelKey ? { key: viewModelKey } : undefined)
  const uiState = useStateFlow(viewModel.uiState)
  const previewRef = useRef<HTMLVideoElement | null>(null)
  const { t, i18n } = useTranslation('common')
  const { resolvedMode, toggleMode } = useKvtTheme()
  const toasts = useToast()
  const microphones = uiState.devices.filter((device) => device.kind === 'audio-input')
  const cameras = uiState.devices.filter((device) => device.kind === 'video-input')

  useEffect(() => {
    viewModel.onEvent({ type: open ? 'opened' : 'closed' })
  }, [open, viewModel])

  useSharedFlow(viewModel.uiEffect, (effect) => {
    if (effect.type === 'show-error') {
      toasts.error(t(effect.message))
    }
  })

  return (
    <Dialog
      className="animate-panel-in !my-0 max-h-[calc(100dvh-1.5rem)] w-full !max-w-[58rem] overflow-hidden rounded-[2rem] bg-surface-elevated !p-0"
      open={open}
    >
      <div className="relative grid max-h-[calc(100dvh-1.5rem)] min-h-[30rem] overflow-hidden md:grid-cols-[14rem_minmax(0,1fr)]">
        <Button
          aria-label={t('settings.close')}
          className="absolute right-4 top-4 z-10 size-9 rounded-full p-0"
          onClick={onClose}
          size="icon"
          type="button"
          variant="ghost"
        >
          <CloseIcon />
        </Button>

        <SettingsSidebar
          activeTab={uiState.activeTab}
          language={i18n.language}
          mode={resolvedMode}
          onTabSelect={(tab) => viewModel.onEvent({ type: 'tab-selected', tab })}
          onToggleMode={toggleMode}
        />

        <section className="min-h-0 overflow-y-auto overscroll-contain p-5 pr-14 sm:p-6 sm:pr-16">
          {uiState.error && (
            <Alert className="mb-4 rounded-3xl">
              <AlertDescription>{t(uiState.error)}</AlertDescription>
            </Alert>
          )}

          {uiState.activeTab === 'profile' && (
            <ProfileSettings
              displayName={uiState.displayName}
              loading={uiState.loading}
              onDisplayNameChange={(value) =>
                viewModel.onEvent({ type: 'display-name-changed', value })
              }
            />
          )}

          {uiState.activeTab === 'media' && (
            <MediaSettings
              cameraEnabled={uiState.cameraEnabled}
              cameras={cameras}
              microphones={microphones}
              micEnabled={uiState.micEnabled}
              previewAvailable={Boolean(uiState.preview?.previewAvailable)}
              previewRef={previewRef}
              previewStream={uiState.preview?.stream ?? null}
              selectedCameraId={uiState.selectedCameraId}
              selectedMicrophoneId={uiState.selectedMicrophoneId}
              onCameraChange={(enabled) => viewModel.onEvent({ type: 'camera-toggled', enabled })}
              onCameraSelect={(deviceId) =>
                viewModel.onEvent({ type: 'camera-selected', deviceId })
              }
              onMicrophoneChange={(enabled) =>
                viewModel.onEvent({ type: 'microphone-toggled', enabled })
              }
              onMicrophoneSelect={(deviceId) =>
                viewModel.onEvent({ type: 'microphone-selected', deviceId })
              }
            />
          )}

          {uiState.activeTab === 'audio' && (
            <AudioSettings
              audioProcessing={uiState.audioProcessing}
              meter={uiState.audioMeter}
              onMonitorChange={(enabled) =>
                viewModel.onEvent({ type: 'audio-monitor-toggled', enabled })
              }
              onPluginAdd={(kind) => viewModel.onEvent({ type: 'audio-plugin-added', kind })}
              onPluginConfigChange={(pluginId, config) =>
                viewModel.onEvent({ type: 'audio-plugin-config-changed', pluginId, config })
              }
              onPluginDrop={(pluginId, targetPluginId) =>
                viewModel.onEvent({ type: 'audio-plugin-dropped', pluginId, targetPluginId })
              }
              onPluginEnabledChange={(pluginId, enabled) =>
                viewModel.onEvent({ type: 'audio-plugin-enabled-changed', pluginId, enabled })
              }
              onPluginMove={(pluginId, direction) =>
                viewModel.onEvent({ type: 'audio-plugin-moved', pluginId, direction })
              }
              onPluginRemove={(pluginId) =>
                viewModel.onEvent({ type: 'audio-plugin-removed', pluginId })
              }
            />
          )}

          {uiState.activeTab === 'appearance' && (
            <AppearanceSettings
              language={i18n.language}
              mode={resolvedMode}
              onLanguageChange={setLanguage}
              onToggleMode={toggleMode}
            />
          )}
        </section>
      </div>
    </Dialog>
  )
}
