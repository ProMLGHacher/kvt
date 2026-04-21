import { kvtFeatureRoute, kvtLayoutRoute, kvtRoute } from '@kvt/react'
import { AppLayout, FeatureFallback } from '../App'
import { CounterScreen } from '../features/counter/CounterScreen'

/**
 * Routes are now declarative framework inputs.
 *
 * The framework turns this into React Router config and installs feature DI
 * modules during route loading.
 */
export const appRoutes = [
  kvtLayoutRoute({
    element: <AppLayout />,
    fallback: <FeatureFallback />,
    children: [
      kvtRoute({
        index: true,
        element: <CounterScreen />,
      }),
      kvtFeatureRoute({
        path: 'reports',
        module: () => import('../features/reports/di'),
        component: () => import('../features/reports/ReportsPage')
      })
    ]
  })
]