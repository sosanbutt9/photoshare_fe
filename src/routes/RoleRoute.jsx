import { Navigate } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import { userMeetsRoleAllowlist } from '../lib/apiHelpers'
import { Loader } from '../components/ui/Loader'

export function RoleRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user, sessionReady } = useAppSelector((s) => s.auth)

  if (!sessionReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <Loader label="Loading…" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!userMeetsRoleAllowlist(user, allowedRoles)) {
    return <Navigate to="/explore" replace />
  }

  return children
}
