import WaterIcon from '@mui/icons-material/Water'
import { Suspense, lazy, type ReactNode } from 'react'
import type { RouteObject } from 'react-router-dom'
import PondDashboardPage from './pond/pages/PondDashboardPage'

// Chart pages pull in @mui/x-charts, so load them on demand.
const DeviceDetailPage = lazy(() => import('./pond/pages/DeviceDetailPage'))

export interface Feature {
  path: string
  label: string
  icon: ReactNode
  routes: RouteObject[]
}

// Add a new feature here: it gets a nav entry and its routes automatically.
export const FEATURES: Feature[] = [
  {
    path: '/pond',
    label: 'Pond monitoring',
    icon: <WaterIcon />,
    routes: [
      { path: 'pond', element: <PondDashboardPage /> },
      { path: 'pond/devices/:deviceId', element: <Suspense><DeviceDetailPage /></Suspense> },
    ],
  },
]
