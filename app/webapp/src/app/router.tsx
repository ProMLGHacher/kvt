import { kvtFeatureRoute, kvtLayoutRoute } from '@kvt/react'
import { AppLayout, FeatureFallback } from './App'

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
      kvtFeatureRoute({
        index: true,
        moduleKey: 'home',
        module: () => import('@features/home/di'),
        component: () => import('@features/home/presentation/view/HomePage').then((m) => m.HomePage)
      }),
      kvtFeatureRoute({
        path: '/home',
        moduleKey: 'home',
        module: () => import('@features/home/di'),
        component: () => import('@features/home/presentation/view/HomePage').then((m) => m.HomePage)
      }),
      // Room route owns the heavy conference ViewModel and its prejoin dependencies.
      kvtFeatureRoute({
        path: '/rooms/:roomId',
        moduleKey: 'room',
        module: () => import('@features/room/di'),
        component: () => import('@features/room/presentation/view/RoomPage').then((m) => m.RoomPage)
      })
    ]
  })
]
