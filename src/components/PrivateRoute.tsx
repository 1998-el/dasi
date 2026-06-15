import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { type UserRole } from '@/types/restaurant'

interface PrivateRouteProps {
  children: React.ReactNode
  roles?: UserRole | UserRole[]
}

export function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const { user, hasRole, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user.onboardingStatus && user.onboardingStatus !== 'COMPLETED') {
    return <Navigate to="/register" state={{ from: location }} replace />
  }

  if (roles && !hasRole(roles)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
