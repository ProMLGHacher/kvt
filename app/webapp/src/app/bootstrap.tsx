import { createRoot } from 'react-dom/client'
import { createKvt } from '@kvt/core'
import { KvtProvider, KvtRouterProvider } from '@kvt/react'
import { KvtThemeProvider } from '@kvt/theme'
import { Suspense } from 'react'
import { initI18n } from '../core/i18n/config'
import './styles/index.css'
import { counterModule } from '../features/counter/di'
import { appRoutes } from './router'

initI18n()

const runtime = createKvt({
  modules: [counterModule]
})

createRoot(document.getElementById('root')!).render(
  <KvtThemeProvider>
    <KvtProvider runtime={runtime}>
      <Suspense fallback={null}>
        <KvtRouterProvider routes={appRoutes} />
      </Suspense>
    </KvtProvider>
  </KvtThemeProvider>
)
