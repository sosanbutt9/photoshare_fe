import { Link, useParams } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, MapPin, User, UserRound, Video } from 'lucide-react'
import * as videoService from '../services/videoService'
import { videoMediaUrls } from '../lib/apiHelpers'
import { Button } from '../components/ui/Button'

export function VideoView() {
  const { id } = useParams()
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [active, setActive] = useState(0)

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

  useEffect(() => {
    loadVideo()
  }, [loadVideo])

  useEffect(() => {
    setActive(0)
  }, [video?.id])

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
  const created = video.created_at ? new Date(video.created_at).toLocaleDateString() : null
  const taggedPeople = String(video.people_present || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
  const location = video.location || ''
  const n = media.length
  const safeIndex = n ? Math.min(active, n - 1) : 0
  const activeSrc = n ? media[safeIndex] : ''

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
                @{creator}
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
    </div>
  )
}
