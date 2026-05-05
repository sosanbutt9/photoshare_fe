import { Link, useParams } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Calendar, User, UserRound } from 'lucide-react'
import * as videoService from '../services/videoService'
import { videoMediaUrls } from '../lib/apiHelpers'
import { Button } from '../components/ui/Button'

export function VideoView() {
  const { id } = useParams()
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-navy-500">Loading video…</div>
  }

  if (error || !video) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-lg font-semibold text-navy-950">We could not open this video.</p>
        <p className="mt-2 text-navy-600">{error}</p>
        <Link to="/creator/videos" className="mt-8 inline-block">
          <Button variant="secondary" className="font-semibold">
            Back to videos
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <Link
        to="/creator/videos"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-navy-900 hover:text-navy-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to creator videos
      </Link>

      <div className="overflow-hidden rounded-xl border border-navy-100 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="space-y-2 bg-navy-50 p-3">
            {media.map((src, idx) => (
              <video
                key={`${src}-${idx}`}
                src={src}
                className="w-full rounded-lg bg-black"
                controls
                preload="metadata"
              />
            ))}
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
