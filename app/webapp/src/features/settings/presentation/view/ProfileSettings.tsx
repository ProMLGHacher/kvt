import { useTranslation } from 'react-i18next'
import { Field, FieldHint, Input, Label } from '@core/design-system'

export interface ProfileSettingsProps {
  readonly displayName: string
  readonly loading: boolean
  readonly onDisplayNameChange: (value: string) => void
}

export function ProfileSettings({
  displayName,
  loading,
  onDisplayNameChange
}: ProfileSettingsProps) {
  const { t } = useTranslation('common')

  return (
    <div className="max-w-2xl">
      <h3 className="text-2xl font-semibold text-foreground">{t('settings.profile.title')}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {t('settings.profile.description')}
      </p>

      <Field className="mt-5">
        <Label htmlFor="settings-display-name">{t('settings.profile.name')}</Label>
        <Input
          id="settings-display-name"
          className="min-h-12 rounded-3xl"
          disabled={loading}
          value={displayName}
          onChange={(event) => onDisplayNameChange(event.target.value)}
        />
        <FieldHint>{t('settings.profile.hint')}</FieldHint>
      </Field>
    </div>
  )
}
