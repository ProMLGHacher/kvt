import { createBrowserRouter } from 'react-router-dom'
import { LandingPage } from '@/features/home/landing-page'
import { RoomPage } from '@/features/room/room-page'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />
  },
  {
    path: '/rooms/:roomId',
    element: <RoomPage />
  }
])
