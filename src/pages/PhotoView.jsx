import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'
import * as photoService from '../services/photoService'
import * as commentService from '../services/commentService'
import * as ratingService from '../services/ratingService'
import { normalizeList } from '../lib/apiHelpers'
import { useAppSelector } from '../store/hooks'
import { PhotoDetails } from '../components/photo/PhotoDetails'
import { RatingStars } from '../components/photo/RatingStars'
import { CommentBox } from '../components/photo/CommentBox'
import { CommentList } from '../components/photo/CommentList'
import { Loader } from '../components/ui/Loader'
import { Button } from '../components/ui/Button'

export function PhotoView() {
  const { id } = useParams()
  const { user, isAuthenticated } = useAppSelector((s) => s.auth)
  const [photo, setPhoto] = useState(null)
  const [comments, setComments] = useState([])
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [commentBusy, setCommentBusy] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [ratingBusy, setRatingBusy] = useState(false)
  const [userRating, setUserRating] = useState(0)

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
