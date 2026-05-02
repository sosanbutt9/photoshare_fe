import { Navigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import { Loader } from '../components/ui/Loader'

/** Login / register: wait for session bootstrap, then redirect authenticated users away. */
export function GuestRoute({ children }) {
  const location = useLocation()
  const { isAuthenticated, sessionReady } = useAppSelector((s) => s.auth)

  const raw = location.state?.from
  const from =
    typeof raw === 'string' &&
    raw.startsWith('/') &&
    raw !== '/login' &&
    raw !== '/register'
      ? raw
      : '/explore'

  if (!sessionReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <Loader label="Loading…" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  return children
}
