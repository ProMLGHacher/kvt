import { createRoot } from 'react-dom/client'
import { createKvt } from '@kvt/core'
import { KvtProvider, KvtRouterProvider } from '@kvt/react'
import { KvtThemeProvider } from '@kvt/theme'
import { Suspense } from 'react'
import { initI18n } from '@core/i18n/config'
import { KvatumLoader, ToastProvider } from '@core/design-system'
import './styles/index.css'
import { appRoutes } from './router'
import { appModule } from './di'

initI18n()

const runtime = createKvt({ modules: [appModule] })

createRoot(document.getElementById('root')!).render(
  <KvtThemeProvider>
    <KvtProvider runtime={runtime}>
      <ToastProvider>
        <Suspense
          fallback={
            <div className="grid min-h-screen place-items-center">
              <KvatumLoader />
            </div>
          }
        >
          <KvtRouterProvider routes={appRoutes} />
        </Suspense>
      </ToastProvider>
    </KvtProvider>
  </KvtThemeProvider>
)
