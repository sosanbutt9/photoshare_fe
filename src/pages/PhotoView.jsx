import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft, Heart, Pencil, Trash2 } from 'lucide-react'
import * as photoService from '../services/photoService'
import * as commentService from '../services/commentService'
import * as ratingService from '../services/ratingService'
import { isAdminUser, normalizeList } from '../lib/apiHelpers'
import { useAppSelector } from '../store/hooks'
import { PhotoDetails } from '../components/photo/PhotoDetails'
import { RatingStars } from '../components/photo/RatingStars'
import { CommentBox } from '../components/photo/CommentBox'
import { CommentList } from '../components/photo/CommentList'
import { Loader } from '../components/ui/Loader'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'

export function PhotoView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAppSelector((s) => s.auth)
  const [photo, setPhoto] = useState(null)
  const [comments, setComments] = useState([])
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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
  const [editImageFiles, setEditImageFiles] = useState([])
  const [editImageKey, setEditImageKey] = useState(0)

  const loadPhoto = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await photoService.getPhoto(id)
      setPhoto(data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Photo not found')
      setPhoto(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  const loadComments = useCallback(async () => {
    try {
      const data = await commentService.listComments(id)
      setComments(normalizeList(data))
    } catch {
      setComments([])
    }
  }, [id])

  const loadRatings = useCallback(async () => {
    try {
      const data = await ratingService.listRatings(id)
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
    loadPhoto()
  }, [loadPhoto])

  useEffect(() => {
    if (!id || error) return
    loadComments()
    loadRatings()
  }, [id, error, loadComments, loadRatings])

  const ratingCount = photo?.ratings_count ?? ratings.length

  const averageRating = useMemo(() => {
    if (photo?.average_rating != null) return Number(photo.average_rating)
    if (photo?.avg_rating != null) return Number(photo.avg_rating)
    if (!ratings.length) return null
    const nums = ratings
      .map((r) => Number(r.rating ?? r.score ?? r.stars))
      .filter((n) => !Number.isNaN(n) && n > 0)
    if (!nums.length) return null
    return nums.reduce((a, b) => a + b, 0) / nums.length
  }, [photo, ratings])

  const handleComment = async ({ body }) => {
    if (!isAuthenticated) {
      toast.error('Log in to comment')
      return
    }
    setCommentBusy(true)
    try {
      await commentService.createComment(id, { body })
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
      toast.error('Log in to rate photos')
      return
    }
    setRatingBusy(true)
    try {
      await ratingService.ratePhoto(id, rating)
      setUserRating(rating)
      toast.success('Thanks for your rating')
      await loadRatings()
      await loadPhoto()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Could not save rating')
    } finally {
      setRatingBusy(false)
    }
  }

  const creatorId = photo?.creator?.id ?? photo?.creator_id
  const canManagePost =
    isAuthenticated &&
    creatorId != null &&
    user?.id != null &&
    (Number(creatorId) === Number(user.id) || isAdminUser(user))

  const saveEdit = async () => {
    if (!id) return
    setSaveBusy(true)
    try {
      const updated = await photoService.updatePhoto(id, { ...editForm, imageFiles: editImageFiles })
      setPhoto(updated)
      toast.success('Post updated')
      setEditOpen(false)
      setEditImageFiles([])
      setEditImageKey((k) => k + 1)
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

  const beginEditPost = () => {
    if (!photo) return
    setEditImageFiles([])
    setEditImageKey((k) => k + 1)
    setEditForm({
      title: photo.title || '',
      caption: photo.caption || '',
      location: photo.location || '',
      people_present: photo.people_present || '',
    })
    setEditOpen(true)
  }

  const closeEditPost = () => {
    setEditOpen(false)
    setEditImageFiles([])
    setEditImageKey((k) => k + 1)
  }

  const confirmDeletePost = async () => {
    if (!id) return
    setDeleteBusy(true)
    try {
      await photoService.deletePhoto(id)
      toast.success('Post deleted')
      setDeleteOpen(false)
      navigate('/explore')
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Could not delete post')
    } finally {
      setDeleteBusy(false)
    }
  }

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Log in to like')
      return
    }
    setLikeBusy(true)
    try {
      const data = await photoService.togglePhotoLike(id)
      setPhoto((p) =>
        p ? { ...p, likes_count: data.likes_count, liked_by_me: data.liked } : p
      )
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Could not update like')
    } finally {
      setLikeBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Loader label="Loading photo…" />
      </div>
    )
  }

  if (error || !photo) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-lg font-semibold text-navy-950">We could not open this photo.</p>
        <p className="mt-2 text-navy-600">{error}</p>
        <Link to="/explore" className="mt-8 inline-block">
          <Button variant="secondary" className="font-semibold">
            Back to explore
          </Button>
        </Link>
      </div>
    )
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

      <PhotoDetails photo={photo} />

      {canManagePost ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={beginEditPost}>
            <Pencil className="mr-1.5 h-4 w-4" aria-hidden />
            Edit post
          </Button>
          <Button type="button" variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-1.5 h-4 w-4" aria-hidden />
            Delete post
          </Button>
        </div>
      ) : null}

      <section className="mt-8 rounded-xl border border-navy-100 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-navy-950">Likes</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant={photo.liked_by_me ? 'primary' : 'secondary'}
            size="sm"
            className="font-semibold"
            loading={likeBusy}
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 ${photo.liked_by_me ? 'fill-current' : ''}`} aria-hidden />
            {photo.liked_by_me ? 'Liked' : 'Like'} · {photo.likes_count ?? 0}
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
      </section>

      <section className="mt-8 rounded-xl border border-navy-100 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-base font-semibold text-navy-950">Ratings</h2>
        <p className="mt-1 text-sm text-navy-600">
          {averageRating != null
            ? `Average ${averageRating.toFixed(1)} out of 5 from ${ratingCount || 'several'} votes.`
            : 'Be the first to rate this photo.'}
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

      <Modal
        open={editOpen}
        onClose={closeEditPost}
        title="Edit post"
        footer={
          <>
            <Button variant="secondary" onClick={closeEditPost}>
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
            <label htmlFor="photo-view-edit-caption" className="mb-1.5 block text-sm font-medium text-navy-800">
              Caption
            </label>
            <textarea
              id="photo-view-edit-caption"
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
            <label htmlFor="photo-view-edit-images" className="mb-1.5 block text-sm font-medium text-navy-800">
              Replace images
            </label>
            <input
              key={editImageKey}
              id="photo-view-edit-images"
              type="file"
              accept="image/*"
              multiple
              className="block w-full text-sm text-navy-600 file:mr-4 file:rounded-lg file:border-0 file:bg-navy-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-navy-900 hover:file:bg-navy-100"
              onChange={(e) => {
                const list = e.target.files
                setEditImageFiles(list && list.length ? Array.from(list) : [])
              }}
            />
            <p className="mt-1 text-xs text-navy-500">
              Optional — first file is the cover; up to 10 images replace the entire carousel.
            </p>
            {editImageFiles.length ? (
              <p className="mt-1 text-xs font-medium text-navy-700">{editImageFiles.length} file(s) selected</p>
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
            <Button variant="danger" loading={deleteBusy} onClick={confirmDeletePost}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-navy-600">
          This removes the photo from PhotoShare Cloud for everyone. Comments and ratings are removed with it. This
          cannot be undone.
        </p>
      </Modal>

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
