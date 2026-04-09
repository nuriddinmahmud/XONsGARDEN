import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { DashboardPage } from '../pages/DashboardPage'
import { DrainagePage } from '../pages/DrainagePage'
import { EnergyPage } from '../pages/EnergyPage'
import { FertilizerPage } from '../pages/FertilizerPage'
import { FoodPage } from '../pages/FoodPage'
import { LoginPage } from '../pages/LoginPage'
import { OilPage } from '../pages/OilPage'
import { RemontPage } from '../pages/RemontPage'
import { ReportsPage } from '../pages/ReportsPage'
import { SettingsPage } from '../pages/SettingsPage'
import { TaxPage } from '../pages/TaxPage'
import { TransportPage } from '../pages/TransportPage'
import { WorkersPage } from '../pages/WorkersPage'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRouter() {
  return (
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
  )
}
