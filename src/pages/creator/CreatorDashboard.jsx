import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, LayoutGrid, Mail, Sparkles } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { getLoggedInUser } from '../../store/authSlice'
import { formatRoleLabel } from '../../lib/apiHelpers'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { StatsCard } from '../../components/dashboard/StatsCard'
import { Button } from '../../components/ui/Button'
export function CreatorDashboard() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((s) => s.auth)

  useEffect(() => {
    dispatch(getLoggedInUser())
  }, [dispatch])

  return (
    <DashboardLayout
      title="Studio"
      description="Jump to upload or manage posts — your public grid lives on Profile."
      maxWidthClassName="max-w-3xl"
      headingClassName="text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl"
    >
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl border border-navy-100 bg-gradient-to-br from-navy-50 via-white to-navy-50/40 p-6 shadow-sm ring-1 ring-navy-900/[0.03] sm:p-7">
          <div
            className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-navy-200/25 blur-2xl"
            aria-hidden
          />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-navy-700">
                Welcome back
              </p>
              <p className="mt-1 break-words text-2xl font-semibold tracking-tight text-navy-950 sm:text-3xl">
                {user?.username || user?.email || 'Creator'}
              </p>
              <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-navy-600">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-navy-700" aria-hidden />
                <span>Your uploads appear on Explore and on your profile grid.</span>
              </p>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:min-w-[10.5rem]">
              <Link to="/creator/upload" className="block sm:inline-block">
                <Button className="w-full font-semibold sm:w-auto sm:min-w-[10.5rem]">New post</Button>
              </Link>
              <Link to="/creator/photos" className="block sm:inline-block">
                <Button variant="secondary" className="w-full font-semibold sm:w-auto sm:min-w-[10.5rem]">
                  Your photos
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatsCard
            icon={BadgeCheck}
            label="Role"
            value={formatRoleLabel(user?.role)}
            hint={
              formatRoleLabel(user?.role) === 'Creator'
                ? 'Eligible to upload and curate'
                : 'Your permissions on PhotoShare Cloud'
            }
          />
          <StatsCard
            icon={Mail}
            label="Email"
            value={user?.email || '—'}
            hint="Used for account notifications"
          />
          <StatsCard
            icon={LayoutGrid}
            label="Profile"
            value="Grid layout"
            hint="Matches Instagram-style presentation"
          />
        </div>
      </div>
    </DashboardLayout>
  )
}
