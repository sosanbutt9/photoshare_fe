import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { Grid3x3, LogOut, Mail, Star, UserRound, UserCircle } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { getLoggedInUser, updateProfile, clearAuthError, logout } from '../store/authSlice'
import * as photoService from '../services/photoService'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Loader } from '../components/ui/Loader'
import { Modal } from '../components/ui/Modal'
import {
  formatRoleLabel,
  normalizeList,
  normalizeRole,
  photoImageUrl,
  isCreatorCapable,
} from '../lib/apiHelpers'

const schema = z.object({
  username: z.string().min(2, 'At least 2 characters').max(150, 'Too long'),
  email: z.string().min(1, 'Required').email('Invalid email'),
  full_name: z.string().max(255, 'Too long').optional(),
})

function roleHint(role) {
  const r = normalizeRole(role)
  if (r === 'admin') return 'Admin · Full platform access'
  if (r === 'creator') return 'Creator · Upload and share photos'
  return 'Browse and discover photos on PhotoShare Cloud'
}

function formatStat(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`
  if (n >= 10_000) return `${Math.round(n / 1000)}k`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(Math.round(n))
}

function ProfileAvatar({ username, fullName }) {
  const initial = (fullName?.trim()?.[0] || username?.trim()?.[0] || '?').toUpperCase()
  return (
    <div
      className="flex h-[77px] w-[77px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy-600 to-navy-950 text-2xl font-light text-white ring-1 ring-navy-100 sm:h-[150px] sm:w-[150px] sm:text-5xl sm:ring-2"
      aria-hidden
    >
      {initial}
    </div>
  )
}

export function Profile() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user, loading, error } = useAppSelector((s) => s.auth)
  const [editOpen, setEditOpen] = useState(false)
  const [photos, setPhotos] = useState([])
  const [photosLoading, setPhotosLoading] = useState(true)
  const [photosError, setPhotosError] = useState(null)

  const uid = user?.id ?? user?.pk
  const creatorCapable = isCreatorCapable(user)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      email: '',
      full_name: '',
    },
  })

  const loadPhotos = useCallback(async () => {
    setPhotosLoading(true)
    setPhotosError(null)
    try {
      if (uid == null) {
        setPhotos([])
        return
      }
      const data = await photoService.listPhotos({ creator: uid })
      setPhotos(normalizeList(data))
    } catch (e) {
      setPhotosError(e.response?.data?.detail || e.message || 'Could not load posts')
      setPhotos([])
    } finally {
      setPhotosLoading(false)
    }
  }, [uid])

  useEffect(() => {
    dispatch(getLoggedInUser())
  }, [dispatch])

  useEffect(() => {
    dispatch(clearAuthError())
  }, [dispatch])

  useEffect(() => {
    if (!user) return
    reset({
      username: user.username ?? '',
      email: user.email ?? '',
      full_name: user.full_name ?? '',
    })
  }, [user, reset])

  useEffect(() => {
    loadPhotos()
  }, [loadPhotos])

  const aggregates = useMemo(() => {
    let ratings = 0
    let views = 0
    for (const p of photos) {
      ratings += p.ratings_count ?? 0
      views += p.view_count ?? 0
    }
    return { posts: photos.length, ratings, views }
  }, [photos])

  const created =
    user?.created_at != null
      ? new Date(user.created_at).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : null

  const onSubmit = handleSubmit(async (values) => {
    const action = await dispatch(
      updateProfile({
        username: values.username.trim(),
        email: values.email.trim(),
        full_name: values.full_name?.trim() ?? '',
      })
    )
    if (updateProfile.fulfilled.match(action)) {
      toast.success('Profile saved')
      reset({
        username: action.payload.username ?? '',
        email: action.payload.email ?? '',
        full_name: action.payload.full_name ?? '',
      })
      setEditOpen(false)
    } else {
      toast.error(action.payload || 'Could not save profile')
    }
  })

  const username = user?.username || user?.email || 'member'

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Signed out')
    navigate('/', { replace: true })
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center bg-white px-4">
        <Loader label="Loading profile…" />
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] bg-white">
      <div className="mx-auto max-w-[935px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <header className="border-b border-navy-100 pb-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:gap-10 md:gap-24 lg:gap-28">
            <div className="flex justify-center sm:block sm:pl-8 md:pl-12">
              <ProfileAvatar username={user.username} fullName={user.full_name} />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-5 text-navy-950">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start">
                <h1 className="max-w-full truncate text-center text-xl font-normal sm:text-left">
                  {username}
                </h1>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="rounded-lg border-navy-200 bg-navy-50 px-4 font-semibold text-navy-950 hover:bg-navy-100 focus-visible:ring-navy-400"
                    onClick={() => setEditOpen(true)}
                  >
                    Edit profile
                  </Button>
                  {creatorCapable ? (
                    <Link to="/creator/upload">
                      <Button
                        type="button"
                        size="sm"
                        className="rounded-lg bg-navy-900 px-4 font-semibold hover:bg-navy-950 focus-visible:ring-navy-600"
                      >
                        New post
                      </Button>
                    </Link>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="rounded-lg font-semibold text-navy-600 hover:bg-navy-50 hover:text-navy-950"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" aria-hidden />
                    Log out
                  </Button>
                </div>
              </div>

              <ul className="flex justify-center gap-6 text-sm sm:justify-start md:gap-10">
                <li>
                  <span className="font-semibold tabular-nums">{formatStat(aggregates.posts)}</span>{' '}
                  <span className="text-navy-600">posts</span>
                </li>
                <li>
                  <span className="font-semibold tabular-nums">{formatStat(aggregates.ratings)}</span>{' '}
                  <span className="text-navy-600">ratings</span>
                </li>
                <li>
                  <span className="font-semibold tabular-nums">{formatStat(aggregates.views)}</span>{' '}
                  <span className="text-navy-600">views</span>
                </li>
              </ul>

              <div className="space-y-1 text-center sm:text-left">
                {user.full_name ? (
                  <p className="text-sm font-semibold text-navy-950">{user.full_name}</p>
                ) : null}
                <p className="text-sm text-navy-600">{roleHint(user.role)}</p>
                <p className="text-xs text-navy-500">
                  {formatRoleLabel(user.role)}
                  {created ? ` · Joined ${created}` : null}
                </p>
              </div>
            </div>
          </div>
        </header>

        <nav
          className="flex justify-center gap-14 border-b border-navy-100 sm:gap-20"
          aria-label="Profile sections"
        >
          <span className="-mb-px flex items-center gap-2 border-t border-navy-950 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-navy-950">
            <Grid3x3 className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
            Posts
          </span>
        </nav>

        <section className="mt-1" aria-label="Your posts">
          {photosLoading ? (
            <div className="py-16">
              <Loader label="Loading posts…" />
            </div>
          ) : photosError ? (
            <p className="py-12 text-center text-sm text-red-600">{photosError}</p>
          ) : !photos.length ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="rounded-full border-2 border-navy-950 p-4">
                <Grid3x3 className="h-10 w-10 text-navy-950" strokeWidth={1.25} aria-hidden />
              </div>
              <p className="text-xl font-light text-navy-950">No posts yet</p>
              <p className="max-w-xs text-sm text-navy-600">
                {creatorCapable
                  ? 'Share a photo and it will show up here.'
                  : 'Photos you upload as a creator will appear here.'}
              </p>
              {creatorCapable ? (
                <Link to="/creator/upload" className="mt-2">
                  <Button
                    size="sm"
                    className="rounded-lg bg-navy-900 px-6 font-semibold hover:bg-navy-950 focus-visible:ring-navy-600"
                  >
                    Create post
                  </Button>
                </Link>
              ) : (
                <Link to="/explore" className="mt-2">
                  <Button variant="secondary" size="sm" className="rounded-lg px-6 font-semibold">
                    Explore photos
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-0.5 sm:gap-1 md:gap-1.5">
              {photos.map((p) => {
                const src = photoImageUrl(p)
                const rc = p.ratings_count ?? 0
                return (
                  <Link
                    key={p.id}
                    to={`/photos/${p.id}`}
                    className="group relative aspect-square overflow-hidden bg-navy-100"
                  >
                    {src ? (
                      <img
                        src={src}
                        alt={p.title || 'Photo'}
                        className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-navy-500">
                        No image
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 hidden items-center justify-center gap-6 bg-black/45 text-sm font-semibold text-white group-hover:flex">
                      <span className="flex items-center gap-1.5 drop-shadow">
                        <Star className="h-5 w-5 fill-white text-white" aria-hidden />
                        {formatStat(rc)}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit profile"
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-navy-700"
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="profile-edit-form"
              size="sm"
              loading={loading}
              disabled={!isDirty}
              className="rounded-lg bg-navy-900 font-semibold hover:bg-navy-950 focus-visible:ring-navy-600"
            >
              Submit
            </Button>
          </>
        }
      >
        <form id="profile-edit-form" className="space-y-4" onSubmit={onSubmit}>
          <Input
            label="Username"
            autoComplete="username"
            placeholder="Username"
            icon={UserRound}
            error={errors.username?.message}
            inputClassName="rounded-md border-navy-200 focus:border-navy-700 focus:ring-navy-700/15"
            {...register('username')}
          />
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            icon={Mail}
            error={errors.email?.message}
            inputClassName="rounded-md border-navy-200 focus:border-navy-700 focus:ring-navy-700/15"
            {...register('email')}
          />
          <Input
            label="Full name"
            autoComplete="name"
            placeholder="Name"
            icon={UserCircle}
            hint="Optional — shown on your profile."
            error={errors.full_name?.message}
            inputClassName="rounded-md border-navy-200 focus:border-navy-700 focus:ring-navy-700/15"
            {...register('full_name')}
          />
          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-2 text-navy-500"
            disabled={!isDirty || loading}
            onClick={() =>
              user &&
              reset({
                username: user.username ?? '',
                email: user.email ?? '',
                full_name: user.full_name ?? '',
              })
            }
          >
            Reset changes
          </Button>
        </form>
      </Modal>
    </div>
  )
}
