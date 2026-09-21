import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'DEPARTMENT' ? '/department' : '/sdo/report'} replace />
  }

  return children
}
