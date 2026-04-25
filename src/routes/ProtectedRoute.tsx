import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { RouteLoader } from '../components/RouteLoader'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute() {
  const { authState, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <RouteLoader />
  }

  if (!authState.isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  return <Outlet />
}
