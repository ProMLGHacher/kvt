import { useTranslation } from 'react-i18next'
import { Field, Label, NativeSelect } from '@core/design-system'
import { supportedLanguages, type SupportedLanguage } from '@core/i18n/config'
import { MoonIcon, SunIcon } from './settings-icons'

export interface AppearanceSettingsProps {
  readonly language: string
  readonly mode: string
  readonly onLanguageChange: (language: SupportedLanguage) => void
  readonly onToggleMode: () => void
}

export function AppearanceSettings({
  language,
  mode,
  onLanguageChange,
  onToggleMode
}: AppearanceSettingsProps) {
  const { t } = useTranslation('common')

  return (
    <div className="max-w-2xl">
      <h3 className="text-2xl font-semibold text-foreground">{t('settings.appearance.title')}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {t('settings.appearance.description')}
      </p>

      <div className="mt-5 grid gap-3">
        <Field>
          <Label htmlFor="settings-language">{t('settings.appearance.language')}</Label>
          <NativeSelect
            id="settings-language"
            className="min-h-12 rounded-3xl"
            value={language}
            onChange={(event) => onLanguageChange(event.target.value as SupportedLanguage)}
          >
            {supportedLanguages.map((supportedLanguage) => (
              <option key={supportedLanguage} value={supportedLanguage}>
                {supportedLanguage.toUpperCase()}
              </option>
            ))}
          </NativeSelect>
        </Field>

        <button
          className="flex min-h-14 items-center justify-between rounded-3xl border border-border/80 bg-surface-overlay px-4 text-left transition hover:bg-surface-elevated"
          onClick={onToggleMode}
          type="button"
        >
          <span>
            <span className="block text-sm font-semibold text-foreground">
              {t('settings.appearance.theme')}
            </span>
            <span className="mt-1 block text-xs text-muted-foreground">
              {mode === 'dark' ? t('settings.appearance.dark') : t('settings.appearance.light')}
            </span>
          </span>
          {mode === 'dark' ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>
    </div>
  )
}
