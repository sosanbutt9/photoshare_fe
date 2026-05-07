import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ChevronLeft, ChevronRight, MapPin, User, UserRound } from 'lucide-react'
import { photoMediaUrls } from '../../lib/apiHelpers'

export function PhotoDetails({ photo }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    setActive(0)
  }, [photo?.id])

  if (!photo) return null

  const urls = photoMediaUrls(photo)
  const title = photo.title || 'Untitled'
  const description = photo.caption || photo.description || ''
  const taggedPeopleRaw = photo.people_present || ''
  const taggedPeople = taggedPeopleRaw
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
  const creator =
    photo.creator_username ||
    photo.creator?.username ||
    photo.owner_username ||
    photo.user?.username ||
    'Unknown'
  const creatorId = photo.creator?.id ?? photo.creator_id
  const location = (photo.location || '').trim()
  const rawDate = photo.created_at || photo.created || photo.uploaded_at
  const created = rawDate ? new Date(rawDate).toLocaleDateString() : null

  const n = urls.length
  const safeIndex = n ? Math.min(active, n - 1) : 0
  const src = n ? urls[safeIndex] : ''

  const goPrev = () => {
    if (n <= 1) return
    setActive((i) => (i <= 0 ? n - 1 : i - 1))
  }

  const goNext = () => {
    if (n <= 1) return
    setActive((i) => (i >= n - 1 ? 0 : i + 1))
  }

  return (
    <div className="overflow-hidden rounded-xl border border-navy-100 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-2">
        <div className="relative aspect-[4/3] bg-navy-50 lg:aspect-auto lg:min-h-[360px]">
          {src ? (
            <img src={src} alt={`${title} — ${safeIndex + 1} of ${n}`} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full min-h-[240px] items-center justify-center text-navy-400">
              No image
            </div>
          )}
          {n > 1 ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-navy-900 shadow-md ring-1 ring-navy-900/10 transition hover:bg-white"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-navy-900 shadow-md ring-1 ring-navy-900/10 transition hover:bg-white"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              <div className="pointer-events-none absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {urls.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-[width,opacity] ${
                      i === safeIndex ? 'w-6 bg-white opacity-100 shadow-sm' : 'w-1.5 bg-white/60 opacity-90'
                    }`}
                    aria-hidden
                  />
                ))}
              </div>
              <span className="sr-only" aria-live="polite">
                Image {safeIndex + 1} of {n}
              </span>
            </>
          ) : null}
        </div>
        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          <h1 className="text-2xl font-semibold tracking-tight text-navy-950 sm:text-3xl">{title}</h1>
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
            {location ? (
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-navy-700" />
                {location}
              </span>
            ) : null}
          </div>
          {description ? (
            <p className="mt-6 whitespace-pre-wrap leading-relaxed text-navy-800">{description}</p>
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
  )
}
