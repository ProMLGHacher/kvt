import { KvtLink, KvtOutlet } from '@kvt/react'
import { useKvtTheme } from '@kvt/theme'
import { useTranslation } from 'react-i18next'
import { setLanguage, supportedLanguages, type SupportedLanguage } from './app/i18n/config'

export function AppLayout() {
  const { t, i18n } = useTranslation('common')
  const { resolvedMode, toggleMode } = useKvtTheme()

  return (
    <main className="h-screen overflow-hidden bg-background text-foreground">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <KvtLink className="text-left text-sm font-semibold uppercase tracking-[0.24em] text-primary" to="/">
          {t('nav.brand')}
        </KvtLink>
        <div className="flex flex-wrap items-center justify-end gap-3 text-sm">
          <KvtLink
            className="rounded-full border border-border bg-surface px-4 py-2 text-surface-foreground"
            to="/"
          >
            {t('nav.main')}
          </KvtLink>
          <KvtLink
            className="rounded-full border border-border bg-surface px-4 py-2 text-surface-foreground"
            to="/reports"
          >
            {t('nav.reports')}
          </KvtLink>
          <select
            aria-label={t('nav.language')}
            className="rounded-full border border-border bg-surface px-4 py-2 text-surface-foreground outline-none ring-ring focus:ring-2"
            value={i18n.language}
            onChange={(event) => void setLanguage(event.target.value as SupportedLanguage)}
          >
            {supportedLanguages.map((language) => (
              <option key={language} value={language}>
                {language.toUpperCase()}
              </option>
            ))}
          </select>
          <button
            className="rounded-full border border-border bg-surface px-4 py-2 text-surface-foreground"
            onClick={toggleMode}
            type="button"
          >
            {t('nav.theme')}: {resolvedMode}
          </button>
        </div>
      </nav>

      <KvtOutlet />
    </main>
  )
}

export function FeatureFallback() {
  const { t } = useTranslation('common')

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="rounded-[2rem] border border-border bg-surface p-8">
        <h2 className="text-2xl font-semibold text-surface-foreground">{t('loading.title')}</h2>
        <p className="mt-3 text-sm text-muted-foreground">{t('loading.description')}</p>
      </div>
    </section>
  )
}
