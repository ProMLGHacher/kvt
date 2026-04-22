import { KvtLink, KvtOutlet } from '@kvt/react'
import { useKvtTheme } from '@kvt/theme'
import { useTranslation } from 'react-i18next'
import { Button, Card, CardContent, NativeSelect, buttonClassName } from '@core/design-system'
import { setLanguage, supportedLanguages, type SupportedLanguage } from '@core/i18n/config'

export function AppLayout() {
  const { t, i18n } = useTranslation('common')
  const { resolvedMode, toggleMode } = useKvtTheme()
  const tx = t as unknown as (key: string) => string

  return (
    <main className="flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <KvtLink
          className="text-left text-sm font-semibold uppercase tracking-widest text-primary"
          to="/"
        >
          {t('nav.brand')}
        </KvtLink>
        <div className="flex items-center justify-end gap-3 text-sm">
          <KvtLink
            className={buttonClassName({
              variant: 'outline',
              size: 'sm',
              className: 'rounded-full bg-surface'
            })}
            to="/"
          >
            {t('nav.main')}
          </KvtLink>
          <NativeSelect
            aria-label={t('nav.language')}
            className="w-auto rounded-full px-4"
            value={i18n.language}
            onChange={(event) => void setLanguage(event.target.value as SupportedLanguage)}
          >
            {supportedLanguages.map((language) => (
              <option key={language} value={language}>
                {language.toUpperCase()}
              </option>
            ))}
          </NativeSelect>
          <Button
            className="rounded-full bg-surface"
            onClick={toggleMode}
            size="sm"
            type="button"
            variant="outline"
          >
            {t('nav.theme')}: {tx(`nav.themeMode.${resolvedMode}`)}
          </Button>
        </div>
      </nav>

      <div className="min-h-0 flex-1">
        <KvtOutlet />
      </div>
    </main>
  )
}

export function FeatureFallback() {
  const { t } = useTranslation('common')

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10">
      <Card className="rounded-4xl">
        <CardContent className="p-8">
          <h2 className="text-2xl font-semibold text-surface-foreground">{t('loading.title')}</h2>
          <p className="mt-3 text-sm text-muted-foreground">{t('loading.description')}</p>
        </CardContent>
      </Card>
    </section>
  )
}
