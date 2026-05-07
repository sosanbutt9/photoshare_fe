import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Pencil,
  Trash2,
  User,
  UserRound,
  Video,
} from 'lucide-react'
import * as videoService from '../services/videoService'
import * as commentService from '../services/commentService'
import * as ratingService from '../services/ratingService'
import { isAdminUser, videoMediaUrls, normalizeList } from '../lib/apiHelpers'
import { useAppSelector } from '../store/hooks'
import { Button } from '../components/ui/Button'
import { RatingStars } from '../components/photo/RatingStars'
import { CommentBox } from '../components/photo/CommentBox'
import { CommentList } from '../components/photo/CommentList'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'

export function VideoView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAppSelector((s) => s.auth)
  const [video, setVideo] = useState(null)
  const [comments, setComments] = useState([])
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [active, setActive] = useState(0)
  const [commentBusy, setCommentBusy] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [ratingBusy, setRatingBusy] = useState(false)
  const [likeBusy, setLikeBusy] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [saveBusy, setSaveBusy] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    caption: '',
    location: '',
    people_present: '',
  })
  const [editVideoFiles, setEditVideoFiles] = useState([])
  const [editVideoKey, setEditVideoKey] = useState(0)

  const loadVideo = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await videoService.getVideo(id)
      setVideo(data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Video not found')
      setVideo(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  const loadComments = useCallback(async () => {
    try {
      const data = await commentService.listVideoComments(id)
      setComments(normalizeList(data))
    } catch {
      setComments([])
    }
  }, [id])

  const loadRatings = useCallback(async () => {
    try {
      const data = await ratingService.listVideoRatings(id)
      const list = normalizeList(data)
      setRatings(list)
      const mine = list.find(
        (r) =>
          (r.user_id ?? r.user?.id) != null &&
          user?.id != null &&
          Number(r.user_id ?? r.user?.id) === Number(user.id)
      )
      const val = mine?.rating ?? mine?.score ?? mine?.stars ?? 0
      setUserRating(Number(val) || 0)
    } catch {
      setRatings([])
    }
  }, [id, user])

  useEffect(() => {
    loadVideo()
  }, [loadVideo])

  useEffect(() => {
    setActive(0)
  }, [video?.id])

  useEffect(() => {
    if (!id || error) return
    loadComments()
    loadRatings()
  }, [id, error, loadComments, loadRatings])

  const ratingCount = video?.ratings_count ?? ratings.length

  const averageRating = useMemo(() => {
    if (video?.average_rating != null) return Number(video.average_rating)
    if (!ratings.length) return null
    const nums = ratings
      .map((r) => Number(r.rating ?? r.score ?? r.stars))
      .filter((n) => !Number.isNaN(n) && n > 0)
    if (!nums.length) return null
    return nums.reduce((a, b) => a + b, 0) / nums.length
  }, [video, ratings])

  const handleComment = async ({ body }) => {
    if (!isAuthenticated) {
      toast.error('Log in to comment')
      return
    }
    setCommentBusy(true)
    try {
      await commentService.createVideoComment(id, { body })
      toast.success('Comment posted')
      await loadComments()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Could not post comment')
    } finally {
      setCommentBusy(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    setDeleteId(commentId)
    try {
      await commentService.deleteComment(commentId)
      toast.success('Comment removed')
      await loadComments()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Could not delete comment')
    } finally {
      setDeleteId(null)
    }
  }

  const handleRate = async (rating) => {
    if (!isAuthenticated) {
      toast.error('Log in to rate videos')
      return
    }
    setRatingBusy(true)
    try {
      await ratingService.rateVideo(id, rating)
      setUserRating(rating)
      toast.success('Thanks for your rating')
      await loadRatings()
      await loadVideo()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Could not save rating')
    } finally {
      setRatingBusy(false)
    }
  }

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Log in to like')
      return
    }
    setLikeBusy(true)
    try {
      const data = await videoService.toggleVideoLike(id)
      setVideo((v) =>
        v
          ? { ...v, likes_count: data.likes_count, liked_by_me: data.liked }
          : v
      )
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Could not update like')
    } finally {
      setLikeBusy(false)
    }
  }

  const creatorIdForAcl = video?.creator?.id ?? video?.creator_id
  const canManageVideo =
    isAuthenticated &&
    creatorIdForAcl != null &&
    user?.id != null &&
    (Number(creatorIdForAcl) === Number(user.id) || isAdminUser(user))

  const saveEdit = async () => {
    if (!id) return
    setSaveBusy(true)
    try {
      const updated = await videoService.updateVideo(id, { ...editForm, videoFiles: editVideoFiles })
      setVideo(updated)
      toast.success('Post updated')
      setEditOpen(false)
      setEditVideoFiles([])
      setEditVideoKey((k) => k + 1)
    } catch (e) {
      const msg =
        e.response?.data?.detail ||
        (typeof e.response?.data === 'object' && JSON.stringify(e.response.data)) ||
        'Could not update post'
      toast.error(typeof msg === 'string' ? msg : 'Could not update post')
    } finally {
      setSaveBusy(false)
    }
  }

  const beginEditVideo = () => {
    if (!video) return
    setEditVideoFiles([])
    setEditVideoKey((k) => k + 1)
    setEditForm({
      title: video.title || '',
      caption: video.caption || '',
      location: video.location || '',
      people_present: video.people_present || '',
    })
    setEditOpen(true)
  }

  const closeEditVideo = () => {
    setEditOpen(false)
    setEditVideoFiles([])
    setEditVideoKey((k) => k + 1)
  }

  const confirmDeleteVideo = async () => {
    if (!id) return
    setDeleteBusy(true)
    try {
      await videoService.deleteVideo(id)
      toast.success('Post deleted')
      setDeleteOpen(false)
      navigate('/explore')
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Could not delete video')
    } finally {
      setDeleteBusy(false)
    }
  }

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-navy-500">Loading video…</div>
  }

  if (error || !video) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-lg font-semibold text-navy-950">We could not open this video.</p>
        <p className="mt-2 text-navy-600">{error}</p>
        <Link to="/explore" className="mt-8 inline-block">
          <Button variant="secondary" className="font-semibold">
            Back to explore
          </Button>
        </Link>
      </div>
    )
  }

  const media = videoMediaUrls(video)
  const creator = video.creator?.username || 'Unknown'
  const creatorId = video.creator?.id
  const created = video.created_at ? new Date(video.created_at).toLocaleDateString() : null
  const taggedPeople = String(video.people_present || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
  const location = video.location || ''
  const n = media.length
  const safeIndex = n ? Math.min(active, n - 1) : 0
  const activeSrc = n ? media[safeIndex] : ''
  const likesCount = video.likes_count ?? 0
  const liked = Boolean(video.liked_by_me)

  const metaChips = []
  if (location) {
    metaChips.push({
      id: 'location',
      icon: MapPin,
      text: location,
    })
  }
  metaChips.push({
    id: 'clips',
    icon: Video,
    text: `${n} clip${n === 1 ? '' : 's'}`,
  })
  if (typeof video.view_count === 'number') {
    metaChips.push({
      id: 'views',
      icon: User,
      text: `${video.view_count} view${video.view_count === 1 ? '' : 's'}`,
    })
  }

  const goPrev = () => {
    if (n <= 1) return
    setActive((i) => (i <= 0 ? n - 1 : i - 1))
  }

  const goNext = () => {
    if (n <= 1) return
    setActive((i) => (i >= n - 1 ? 0 : i + 1))
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        to="/explore"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-navy-900 hover:text-navy-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to explore
      </Link>

      <div className="overflow-hidden rounded-xl border border-navy-100 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="bg-gradient-to-b from-navy-50 to-white p-3 sm:p-4">
            <div className="relative overflow-hidden rounded-lg border border-navy-200 bg-black">
              {activeSrc ? (
                <video
                  key={activeSrc}
                  src={activeSrc}
                  className="h-full max-h-[560px] w-full bg-black object-contain"
                  controls
                  preload="metadata"
                />
              ) : (
                <div className="flex min-h-[320px] items-center justify-center text-sm text-navy-300">No video</div>
              )}
              {n > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-navy-900 shadow-md ring-1 ring-navy-900/10 transition hover:bg-white"
                    aria-label="Previous video"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-navy-900 shadow-md ring-1 ring-navy-900/10 transition hover:bg-white"
                    aria-label="Next video"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-2 py-1 text-xs font-semibold text-white">
                    {safeIndex + 1}/{n}
                  </span>
                </>
              ) : null}
            </div>
            {n > 1 ? (
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
                {media.map((src, idx) => (
                  <button
                    key={`${src}-${idx}`}
                    type="button"
                    onClick={() => setActive(idx)}
                    className={[
                      'relative overflow-hidden rounded-md border text-left transition',
                      idx === safeIndex
                        ? 'border-navy-900 ring-2 ring-navy-900/20'
                        : 'border-navy-200 hover:border-navy-400',
                    ].join(' ')}
                    aria-label={`Play clip ${idx + 1}`}
                  >
                    <video src={src} className="h-16 w-full bg-black object-cover" muted preload="metadata" />
                    <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                      {idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <h1 className="text-2xl font-semibold tracking-tight text-navy-950 sm:text-3xl">
              {video.title || 'Untitled'}
            </h1>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-navy-600">
              <span className="inline-flex items-center gap-2">
                <User className="h-4 w-4 text-navy-700" />
                {creatorId ? (
                  <Link to={`/users/${creatorId}`} className="font-medium text-navy-900 hover:underline">
                    @{creator}
                  </Link>
                ) : (
                  <>@{creator}</>
                )}
              </span>
              {created ? (
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-navy-700" />
                  {created}
                </span>
              ) : null}
            </div>
            {metaChips.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {metaChips.map((chip) => {
                  const Icon = chip.icon
                  return (
                    <span
                      key={chip.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-navy-200 bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy-800"
                    >
                      <Icon className="h-3.5 w-3.5 text-navy-700" />
                      {chip.text}
                    </span>
                  )
                })}
              </div>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant={liked ? 'primary' : 'secondary'}
                size="sm"
                className="font-semibold"
                loading={likeBusy}
                onClick={handleLike}
              >
                <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} aria-hidden />
                {liked ? 'Liked' : 'Like'} · {likesCount}
              </Button>
              {!isAuthenticated ? (
                <span className="text-xs text-navy-500">
                  <Link to="/login" className="font-semibold text-navy-900 underline-offset-2 hover:underline">
                    Log in
                  </Link>{' '}
                  to like.
                </span>
              ) : null}
            </div>
            {video.caption ? (
              <p className="mt-6 whitespace-pre-wrap leading-relaxed text-navy-800">{video.caption}</p>
            ) : (
              <p className="mt-6 text-sm text-navy-500">No caption.</p>
            )}
            {taggedPeople.length ? (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy-600">Tagged people</p>
                <div className="flex flex-wrap gap-2">
                  {taggedPeople.map((name, idx) => (
                    <span
                      key={`${name}-${idx}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-navy-200 bg-navy-50 px-2.5 py-1 text-xs font-medium text-navy-800"
                    >
                      <UserRound className="h-3.5 w-3.5 text-navy-700" />
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {canManageVideo ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={beginEditVideo}>
            <Pencil className="mr-1.5 h-4 w-4" aria-hidden />
            Edit post
          </Button>
          <Button type="button" variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-1.5 h-4 w-4" aria-hidden />
            Delete post
          </Button>
        </div>
      ) : null}

      <Modal
        open={editOpen}
        onClose={closeEditVideo}
        title="Edit video post"
        footer={
          <>
            <Button variant="secondary" onClick={closeEditVideo}>
              Cancel
            </Button>
            <Button loading={saveBusy} onClick={saveEdit}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Title"
            value={editForm.title}
            onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Title"
          />
          <div className="w-full text-left">
            <label htmlFor="video-view-edit-caption" className="mb-1.5 block text-sm font-medium text-navy-800">
              Caption
            </label>
            <textarea
              id="video-view-edit-caption"
              rows={3}
              value={editForm.caption}
              onChange={(e) => setEditForm((p) => ({ ...p, caption: e.target.value }))}
              className="w-full rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-950 shadow-sm placeholder:text-navy-400 focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-600/20"
            />
          </div>
          <Input
            label="Location"
            value={editForm.location}
            onChange={(e) => setEditForm((p) => ({ ...p, location: e.target.value }))}
            placeholder="Location"
          />
          <Input
            label="People present"
            value={editForm.people_present}
            onChange={(e) => setEditForm((p) => ({ ...p, people_present: e.target.value }))}
            placeholder="People present"
          />
          <div className="text-left">
            <label htmlFor="video-view-edit-videos" className="mb-1.5 block text-sm font-medium text-navy-800">
              Replace videos
            </label>
            <input
              key={editVideoKey}
              id="video-view-edit-videos"
              type="file"
              accept="video/*"
              multiple
              className="block w-full text-sm text-navy-600 file:mr-4 file:rounded-lg file:border-0 file:bg-navy-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-navy-900 hover:file:bg-navy-100"
              onChange={(e) => {
                const list = e.target.files
                setEditVideoFiles(list && list.length ? Array.from(list) : [])
              }}
            />
            <p className="mt-1 text-xs text-navy-500">
              Optional — first file is the main clip; up to 10 files replace all clips in the post.
            </p>
            {editVideoFiles.length ? (
              <p className="mt-1 text-xs font-medium text-navy-700">{editVideoFiles.length} file(s) selected</p>
            ) : null}
          </div>
        </div>
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete this post?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleteBusy} onClick={confirmDeleteVideo}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-navy-600">
          This removes the video from PhotoShare Cloud for everyone. Comments and ratings are removed with it. This
          cannot be undone.
        </p>
      </Modal>

      <section className="mt-8 rounded-xl border border-navy-100 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-navy-950">Ratings</h2>
        <p className="mt-1 text-sm text-navy-600">
          {averageRating != null
            ? `Average ${averageRating.toFixed(1)} out of 5 from ${ratingCount || 'several'} votes.`
            : 'Be the first to rate this video.'}
        </p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <RatingStars
            value={userRating}
            onChange={isAuthenticated ? handleRate : undefined}
            disabled={ratingBusy}
            readOnly={!isAuthenticated}
          />
          {!isAuthenticated ? (
            <p className="text-sm text-navy-600">
              <Link to="/login" className="font-semibold text-navy-950 underline-offset-2 hover:underline">
                Log in
              </Link>{' '}
              to leave your rating.
            </p>
          ) : null}
        </div>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-base font-semibold text-navy-950">Comments</h2>
        <CommentBox onSubmit={handleComment} disabled={!isAuthenticated} loading={commentBusy} />
        <CommentList
          comments={comments}
          currentUser={user}
          onDelete={handleDeleteComment}
          deletingId={deleteId}
        />
      </section>
    </div>
  )
}
