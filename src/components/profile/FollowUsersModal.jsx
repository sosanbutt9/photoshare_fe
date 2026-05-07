import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import * as userService from '../../services/userService'
import { normalizeList, userAvatarUrl } from '../../lib/apiHelpers'
import { Modal } from '../ui/Modal'
import { Loader } from '../ui/Loader'

export function FollowUsersModal({ open, onClose, title, userId, mode }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open || userId == null || Number.isNaN(Number(userId))) return
    let cancelled = false
    const t = window.setTimeout(() => {
      if (cancelled) return
      setLoading(true)
      setError(null)
      const load = mode === 'followers' ? userService.listFollowers : userService.listFollowing
      load(Number(userId))
        .then((data) => {
          if (!cancelled) setUsers(normalizeList(data))
        })
        .catch((e) => {
          if (!cancelled) setError(e.response?.data?.detail || 'Could not load this list.')
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 0)
    return () => {
      cancelled = true
      window.clearTimeout(t)
    }
  }, [open, userId, mode])

  return (
    <Modal open={open} onClose={onClose} title={title}>
      {loading ? (
        <div className="py-8">
          <Loader label="Loading…" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : !users.length ? (
        <p className="text-sm text-navy-600">No one here yet.</p>
      ) : (
        <ul className="max-h-[min(60vh,320px)] space-y-2 overflow-y-auto pr-1">
          {users.map((u) => {
            const avatar = userAvatarUrl(u)
            const initial = (
              u.full_name?.trim()?.[0] ||
              u.username?.trim()?.[0] ||
              '?'
            ).toUpperCase()
            return (
              <li key={u.id}>
                <Link
                  to={`/users/${u.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl border border-navy-100 bg-navy-50/50 px-3 py-2.5 transition hover:border-navy-200 hover:bg-white"
                >
                  {avatar ? (
                    <img src={avatar} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-navy-100" />
                  ) : (
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy-600 to-navy-950 text-sm font-medium text-white ring-1 ring-navy-100"
                      aria-hidden
                    >
                      {initial}
                    </div>
                  )}
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate font-semibold text-navy-950">@{u.username}</p>
                    {u.full_name ? (
                      <p className="truncate text-xs text-navy-600">{u.full_name}</p>
                    ) : null}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Modal>
  )
}
