import { useEffect, useState } from 'react'
import { Image as ImageIcon, MessageCircle, Star, Users } from 'lucide-react'
import * as adminService from '../../services/adminService'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { StatsCard } from '../../components/dashboard/StatsCard'
import { Loader } from '../../components/ui/Loader'
function formatStat(value) {
  if (value == null) return '—'
  if (typeof value === 'number') return value.toLocaleString()
  return String(value)
}

export function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await adminService.getAdminStats()
        if (!cancelled) setStats(data)
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.detail || e.message || 'Could not load admin stats')
          setStats(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [])

  const summary = stats?.summary ?? {}
  const users = summary.total_users ?? stats?.users ?? stats?.user_count
  const photos = summary.total_photos ?? stats?.photos ?? stats?.photo_count
  const comments = summary.total_comments ?? stats?.comments ?? stats?.comment_count
  const ratings = summary.total_ratings ?? stats?.ratings ?? stats?.rating_count

  return (
    <DashboardLayout
      title="Admin"
      description="Platform overview — counts refresh each time you open this screen."
    >
      {loading ? (
        <Loader label="Loading platform stats…" />
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-red-800">
          <p className="font-semibold">Unable to load statistics</p>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard label="Users" value={formatStat(users)} icon={Users} />
            <StatsCard label="Photos" value={formatStat(photos)} icon={ImageIcon} />
            <StatsCard label="Comments" value={formatStat(comments)} icon={MessageCircle} />
            <StatsCard label="Ratings" value={formatStat(ratings)} icon={Star} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard label="Creators" value={formatStat(summary.total_creators)} icon={Users} />
            <StatsCard label="Consumers" value={formatStat(summary.total_consumers)} icon={Users} />
            <StatsCard label="Admins" value={formatStat(summary.total_admins)} icon={Users} />
            <StatsCard label="Blocked users" value={formatStat(summary.blocked_users)} icon={Users} />
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
