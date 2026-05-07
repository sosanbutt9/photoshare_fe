import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, Grid3x3, Star, UserPlus, UserMinus } from 'lucide-react'
import * as userService from '../services/userService'
import * as photoService from '../services/photoService'
import { useAppSelector } from '../store/hooks'
import { Button } from '../components/ui/Button'
import { Loader } from '../components/ui/Loader'
import { normalizeList, photoImageUrl, userAvatarUrl, formatStat } from '../lib/apiHelpers'
import { FollowUsersModal } from '../components/profile/FollowUsersModal'

export function UserPublicProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: me, isAuthenticated } = useAppSelector((s) => s.auth)
  const [profile, setProfile] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [photosLoading, setPhotosLoading] = useState(true)
  const [error, setError] = useState(null)
  const [followBusy, setFollowBusy] = useState(false)
  const [followModal, setFollowModal] = useState(null)

  const userId = id != null ? Number(id) : NaN
  const isSelf = isAuthenticated && me?.id != null && Number(me.id) === userId

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const u = await userService.getUserProfile(userId)
      setProfile(u)
    } catch (e) {
      setError(e.response?.data?.detail || 'User not found')
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [userId])

  const loadPhotos = useCallback(async () => {
    setPhotosLoading(true)
    try {
      const data = await photoService.listPhotos({ creator: userId })
      setPhotos(normalizeList(data))
    } catch {
      setPhotos([])
    } finally {
      setPhotosLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (Number.isNaN(userId)) {
      setError('Invalid profile')
      setLoading(false)
      return
    }
    loadProfile()
  }, [userId, loadProfile])

  useEffect(() => {
    if (Number.isNaN(userId) || error) return
    loadPhotos()
  }, [userId, error, loadPhotos])

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Log in to follow')
      navigate('/login')
      return
    }
    if (!profile?.id) return
    setFollowBusy(true)
    try {
      if (profile.is_following) {
        await userService.unfollowUser(profile.id)
        setProfile((p) => (p ? { ...p, is_following: false, followers_count: Math.max(0, (p.followers_count ?? 1) - 1) } : p))
        toast.success('Unfollowed')
      } else {
        await userService.followUser(profile.id)
        setProfile((p) =>
          p ? { ...p, is_following: true, followers_count: (p.followers_count ?? 0) + 1 } : p
        )
        toast.success('Following')
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Could not update follow')
    } finally {
      setFollowBusy(false)
    }
  }

  const aggregates = useMemo(() => {
    let ratings = 0
    let views = 0
    for (const p of photos) {
      ratings += p.ratings_count ?? 0
      views += p.view_count ?? 0
    }
    return { posts: photos.length, ratings, views }
  }, [photos])

  if (loading) {
    return (
      <div className="mx-auto max-w-[935px] px-4 py-16">
        <Loader label="Loading profile…" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="font-semibold text-navy-950">{error || 'Profile unavailable'}</p>
        <Link to="/explore" className="mt-6 inline-block">
          <Button variant="secondary">Back to explore</Button>
        </Link>
      </div>
    )
  }

  const avatar = userAvatarUrl(profile)
  const initial = (profile.full_name?.trim()?.[0] || profile.username?.trim()?.[0] || '?').toUpperCase()

  return (
    <div className="min-h-[60vh] bg-white">
      <div className="mx-auto max-w-[935px] px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <Link
          to="/explore"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-navy-900 hover:text-navy-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to explore
        </Link>

        <header className="border-b border-navy-100 pb-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:gap-10 md:gap-16">
            <div className="flex justify-center sm:block">
              {avatar ? (
                <img
                  src={avatar}
                  alt=""
                  className="h-[77px] w-[77px] shrink-0 rounded-full object-cover ring-1 ring-navy-100 sm:h-[150px] sm:w-[150px] sm:ring-2"
                />
              ) : (
                <div
                  className="flex h-[77px] w-[77px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy-600 to-navy-950 text-2xl font-light text-white ring-1 ring-navy-100 sm:h-[150px] sm:w-[150px] sm:text-5xl sm:ring-2"
                  aria-hidden
                >
                  {initial}
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-4 text-navy-950">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start">
                <h1 className="text-center text-xl font-normal sm:text-left">@{profile.username}</h1>
                {!isSelf ? (
                  <Button
                    type="button"
                    size="sm"
                    loading={followBusy}
                    className="rounded-lg font-semibold"
                    variant={profile.is_following ? 'secondary' : 'primary'}
                    onClick={handleFollowToggle}
                  >
                    {profile.is_following ? (
                      <>
                        <UserMinus className="mr-1.5 h-4 w-4" aria-hidden />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-1.5 h-4 w-4" aria-hidden />
                        Follow
                      </>
                    )}
                  </Button>
                ) : (
                  <Link to="/profile">
                    <Button type="button" size="sm" variant="secondary" className="rounded-lg font-semibold">
                      Your profile
                    </Button>
                  </Link>
                )}
              </div>

              <ul className="flex justify-center gap-6 text-sm sm:justify-start md:gap-10">
                <li>
                  <button
                    type="button"
                    className="text-left transition hover:opacity-80"
                    onClick={() => setFollowModal('followers')}
                  >
                    <span className="font-semibold tabular-nums">{formatStat(profile.followers_count ?? 0)}</span>{' '}
                    <span className="text-navy-600">followers</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="text-left transition hover:opacity-80"
                    onClick={() => setFollowModal('following')}
                  >
                    <span className="font-semibold tabular-nums">{formatStat(profile.following_count ?? 0)}</span>{' '}
                    <span className="text-navy-600">following</span>
                  </button>
                </li>
                <li>
                  <span className="font-semibold tabular-nums">{formatStat(aggregates.posts)}</span>{' '}
                  <span className="text-navy-600">posts</span>
                </li>
              </ul>

              {profile.full_name ? <p className="text-center text-sm font-semibold sm:text-left">{profile.full_name}</p> : null}
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

        <FollowUsersModal
          open={followModal != null}
          onClose={() => setFollowModal(null)}
          title={followModal === 'following' ? 'Following' : 'Followers'}
          userId={profile.id}
          mode={followModal === 'following' ? 'following' : 'followers'}
        />

        <section className="mt-1" aria-label="Posts">
          {photosLoading ? (
            <div className="py-16">
              <Loader label="Loading posts…" />
            </div>
          ) : !photos.length ? (
            <p className="py-12 text-center text-sm text-navy-600">No public posts yet.</p>
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
    </div>
  )
}
