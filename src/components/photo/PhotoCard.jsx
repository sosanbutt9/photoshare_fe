import { Link } from 'react-router-dom'
import { Heart, Layers, MessageCircle, Play, Star, Video } from 'lucide-react'
import { photoImageUrl, videoFileUrl } from '../../lib/apiHelpers'

export function PhotoCard({ photo, compact }) {
  if (!photo) return null
  const isVideo = photo.__kind === 'video' || Boolean(photo.video)
  const id = photo.id
  const title = photo.title || 'Untitled'
  const src = isVideo ? videoFileUrl(photo) : photoImageUrl(photo)
  const creator =
    photo.creator_username ||
    photo.creator?.username ||
    photo.owner_username ||
    photo.user?.username ||
    'Creator'
  const rating =
    photo.average_rating ??
    photo.avg_rating ??
    photo.rating_avg ??
    photo.ratings_avg ??
    null
  const comments = photo.comment_count ?? photo.comments_count ?? null
  const ratingsCount = photo.ratings_count ?? null
  const isCarousel =
    (typeof photo.media_count === 'number' && photo.media_count > 1) ||
    (Array.isArray(photo.media) && photo.media.length > 1)
  const href = isVideo ? `/videos/${id}` : `/photos/${id}`
  const badgeTitle = isVideo ? 'Multiple videos' : 'Multiple photos'

  if (compact) {
    return (
      <Link
        to={href}
        className="group relative aspect-square overflow-hidden bg-navy-100 outline outline-1 outline-white"
      >
        {src ? isVideo ? (
          <video
            src={src}
            className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <img
            src={src}
            alt={title}
            className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-navy-500">—</div>
        )}
        {isVideo ? (
          <span className="pointer-events-none absolute left-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-black/60 text-white shadow-sm">
            <Play className="h-3.5 w-3.5 fill-white text-white" aria-hidden />
          </span>
        ) : null}
        {isCarousel ? (
          <span
            className="pointer-events-none absolute bottom-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-navy-950/75 text-white shadow-sm"
            title={badgeTitle}
          >
            <Layers className="h-3.5 w-3.5" aria-hidden />
          </span>
        ) : null}
        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center gap-5 bg-navy-950/50 text-xs font-semibold text-white group-hover:flex">
          {rating != null ? (
            <span className="flex items-center gap-1 drop-shadow">
              <Star className="h-4 w-4 fill-white text-white" aria-hidden />
              {Number(rating).toFixed(1)}
            </span>
          ) : null}
          {ratingsCount != null ? (
            <span className="flex items-center gap-1 drop-shadow">
              <Heart className="h-4 w-4" aria-hidden />
              {ratingsCount}
            </span>
          ) : null}
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={href}
      className="group overflow-hidden rounded-xl border border-navy-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-navy-200 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-navy-50">
        {src ? isVideo ? (
          <video
            src={src}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <img
            src={src}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-navy-400">No preview</div>
        )}
        {isVideo ? (
          <span className="pointer-events-none absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            <Play className="h-3 w-3 fill-white text-white" />
            Video
          </span>
        ) : null}
        {isCarousel ? (
          <span
            className="pointer-events-none absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-navy-950/75 text-white shadow-md ring-1 ring-white/20"
            title={badgeTitle}
          >
            <Layers className="h-4 w-4" aria-hidden />
          </span>
        ) : null}
      </div>
      <div className="space-y-1.5 p-3 text-left">
        <h3 className="line-clamp-1 text-sm font-semibold text-navy-950">{title}</h3>
        <p className="text-xs text-navy-600">@{creator}</p>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-navy-500">
          {isVideo ? (
            <span className="inline-flex items-center gap-1">
              <Video className="h-3.5 w-3.5" />
              Video
            </span>
          ) : null}
          {rating != null ? (
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-500" fill="currentColor" />
              {Number(rating).toFixed(1)}
            </span>
          ) : null}
          {comments != null ? (
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {comments}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <Heart className="h-3.5 w-3.5 text-rose-400" />
            Open
          </span>
        </div>
      </div>
    </Link>
  )
}
