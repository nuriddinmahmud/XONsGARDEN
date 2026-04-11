import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { RouteLoader } from '../components/RouteLoader'
import { LoginPage } from '../pages/LoginPage'
import { ProtectedRoute } from './ProtectedRoute'

const DashboardLayout = lazy(() =>
  import('../layouts/DashboardLayout').then((module) => ({ default: module.DashboardLayout })),
)

const DashboardPage = lazy(() =>
  import('../pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
)

const WorkersPage = lazy(() =>
  import('../pages/WorkersPage').then((module) => ({ default: module.WorkersPage })),
)

const FoodPage = lazy(() =>
  import('../pages/FoodPage').then((module) => ({ default: module.FoodPage })),
)

const FertilizerPage = lazy(() =>
  import('../pages/FertilizerPage').then((module) => ({ default: module.FertilizerPage })),
)

const TransportPage = lazy(() =>
  import('../pages/TransportPage').then((module) => ({ default: module.TransportPage })),
)

const EnergyPage = lazy(() =>
  import('../pages/EnergyPage').then((module) => ({ default: module.EnergyPage })),
)

const OilPage = lazy(() =>
  import('../pages/OilPage').then((module) => ({ default: module.OilPage })),
)

const RemontPage = lazy(() =>
  import('../pages/RemontPage').then((module) => ({ default: module.RemontPage })),
)

const TaxPage = lazy(() =>
  import('../pages/TaxPage').then((module) => ({ default: module.TaxPage })),
)

const DrainagePage = lazy(() =>
  import('../pages/DrainagePage').then((module) => ({ default: module.DrainagePage })),
)

const ReportsPage = lazy(() =>
  import('../pages/ReportsPage').then((module) => ({ default: module.ReportsPage })),
)

const SettingsPage = lazy(() =>
  import('../pages/SettingsPage').then((module) => ({ default: module.SettingsPage })),
)

export function AppRouter() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Routes>
        <Route element={<LoginPage />} path="/login" />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route element={<Navigate replace to="/dashboard" />} path="/" />
            <Route element={<DashboardPage />} path="/dashboard" />
            <Route element={<WorkersPage />} path="/workers" />
            <Route element={<FoodPage />} path="/food" />
            <Route element={<FertilizerPage />} path="/fertilizer" />
            <Route element={<TransportPage />} path="/transport" />
            <Route element={<EnergyPage />} path="/energy" />
            <Route element={<OilPage />} path="/oil" />
            <Route element={<RemontPage />} path="/remont" />
            <Route element={<TaxPage />} path="/tax" />
            <Route element={<DrainagePage />} path="/drainage" />
            <Route element={<ReportsPage />} path="/reports" />
            <Route element={<SettingsPage />} path="/settings" />
          </Route>
        </Route>

        <Route element={<Navigate replace to="/dashboard" />} path="*" />
      </Routes>
    </Suspense>
  )
}
