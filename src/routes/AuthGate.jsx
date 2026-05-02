import { useLayoutEffect } from 'react'
import { Cloud } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { getLoggedInUser, setSessionReady } from '../store/authSlice'
import { Loader } from '../components/ui/Loader'

/**
 * Restores the user profile when tokens exist in cookies, then allows the router to render.
 */
export function AuthGate({ children }) {
  const dispatch = useAppDispatch()
  const { access, user, sessionReady } = useAppSelector((s) => s.auth)

  useLayoutEffect(() => {
    if (!access) {
      dispatch(setSessionReady(true))
      return
    }
    if (user) {
      dispatch(setSessionReady(true))
      return
    }
    dispatch(getLoggedInUser()).finally(() => {
      dispatch(setSessionReady(true))
    })
  }, [dispatch, access, user])

  if (!sessionReady) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-navy-700 to-navy-950 text-white shadow-lg shadow-navy-900/25">
          <Cloud className="h-8 w-8" aria-hidden />
        </div>
        <Loader label="Restoring your session…" />
        <p className="mt-4 max-w-xs text-center text-xs text-navy-500">
          Checking your saved sign-in. This only takes a moment.
        </p>
      </div>
    )
  }

  return children
}
