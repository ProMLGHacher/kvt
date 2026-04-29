import { useState } from 'react'
import { KvtOutlet } from '@kvt/react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import { Button, KvatumLoader } from '@core/design-system'
import { SettingsIcon, SettingsModalHost } from '@features/settings/presentation/view/SettingsModal'

export function AppLayout() {
  const { t } = useTranslation('common')
  const location = useLocation()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const roomChromeOwnsSettings = location.pathname.startsWith('/rooms/')

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="min-h-0">
        <KvtOutlet />
      </div>

      {!roomChromeOwnsSettings && (
        <Button
          aria-label={t('settings.title')}
          className="fixed bottom-4 right-4 z-30 size-12 rounded-full p-0 shadow-xl shadow-black/10"
          onClick={() => setSettingsOpen(true)}
          size="icon"
          type="button"
          variant="outline"
        >
          <SettingsIcon />
        </Button>
      )}

      {!roomChromeOwnsSettings && (
        <SettingsModalHost
          open={settingsOpen}
          viewModelKey="settings:global"
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </main>
  )
}

export function FeatureFallback() {
  const { t } = useTranslation('common')

  return (
    <section className="grid min-h-screen place-items-center px-4 py-10">
      <div className="grid justify-items-center gap-5 text-center">
        <KvatumLoader label={t('loading.title')} />
        <div>
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
            {t('loading.title')}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{t('loading.description')}</p>
        </div>
      </div>
    </section>
  )
}
