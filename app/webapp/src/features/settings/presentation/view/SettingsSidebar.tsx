import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, NativeSelect, cn } from '@core/design-system'
import { setLanguage, supportedLanguages, type SupportedLanguage } from '@core/i18n/config'
import type { SettingsTab } from '../model/SettingsState'
import { AudioIcon, CameraIcon, MoonIcon, SparkIcon, SunIcon, UserIcon } from './settings-icons'

export interface SettingsSidebarProps {
  readonly activeTab: SettingsTab
  readonly language: string
  readonly mode: string
  readonly onTabSelect: (tab: SettingsTab) => void
  readonly onToggleMode: () => void
}

export function SettingsSidebar({
  activeTab,
  language,
  mode,
  onTabSelect,
  onToggleMode
}: SettingsSidebarProps) {
  const { t } = useTranslation('common')

  return (
    <aside className="flex min-h-0 flex-col justify-between border-b border-border/70 bg-background/54 p-4 md:border-b-0 md:border-r">
      <div className="flex flex-col justify-start gap-6">
        <h2 className="mt-1 text-xl font-semibold text-foreground">{t('settings.title')}</h2>
        <nav className="grid gap-2">
          <SettingsTabButton
            active={activeTab === 'profile'}
            icon={<UserIcon />}
            label={t('settings.tabs.profile')}
            onClick={() => onTabSelect('profile')}
          />
          <SettingsTabButton
            active={activeTab === 'media'}
            icon={<CameraIcon />}
            label={t('settings.tabs.media')}
            onClick={() => onTabSelect('media')}
          />
          <SettingsTabButton
            active={activeTab === 'audio'}
            icon={<AudioIcon />}
            label={t('settings.tabs.audio')}
            onClick={() => onTabSelect('audio')}
          />
          <SettingsTabButton
            active={activeTab === 'appearance'}
            icon={<SparkIcon />}
            label={t('settings.tabs.appearance')}
            onClick={() => onTabSelect('appearance')}
          />
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <NativeSelect
          value={language}
          onChange={(event) => setLanguage(event.target.value as SupportedLanguage)}
        >
          {supportedLanguages.map((supportedLanguage) => (
            <option key={supportedLanguage} value={supportedLanguage}>
              {supportedLanguage.toUpperCase()}
            </option>
          ))}
        </NativeSelect>
        <Button onClick={onToggleMode} size="icon" type="button" variant="ghost">
          {mode === 'dark' ? <MoonIcon /> : <SunIcon />}
        </Button>
      </div>
    </aside>
  )
}

function SettingsTabButton({
  active,
  icon,
  label,
  onClick
}: {
  readonly active: boolean
  readonly icon: ReactNode
  readonly label: string
  readonly onClick: () => void
}) {
  return (
    <button
      className={cn(
        'flex min-h-11 items-center gap-3 rounded-2xl px-3 text-left text-sm font-semibold transition',
        active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-foreground hover:bg-muted'
      )}
      onClick={onClick}
      type="button"
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
