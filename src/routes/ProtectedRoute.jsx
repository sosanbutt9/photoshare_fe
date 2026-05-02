import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import { Loader } from '../components/ui/Loader'

export function ProtectedRoute({ children }) {
  const { isAuthenticated, sessionReady } = useAppSelector((s) => s.auth)
  const location = useLocation()

  if (!sessionReady) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <Loader label="Checking access…" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
