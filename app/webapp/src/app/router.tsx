import { kvtLayoutRoute, kvtRoute } from '@kvt/react'
import { AppLayout, FeatureFallback } from './App'
import { HomePage } from '@features/home/presentation/view/HomePage'
import { RoomPage } from '@features/room/presentation/view/RoomPage'

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
        element: <HomePage />
      }),
      kvtRoute({
        path: '/home',
        element: <HomePage />
      }),
      kvtRoute({
        path: '/rooms/:roomId',
        element: <RoomPage />
      })
    ]
  })
]
