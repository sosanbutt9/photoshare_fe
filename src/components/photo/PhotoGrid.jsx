import { ImageOff } from 'lucide-react'
import { PhotoCard } from './PhotoCard'
import { Loader } from '../ui/Loader'

export function PhotoGrid({
  photos,
  loading,
  error,
  emptyTitle = 'No photos yet',
  emptyHint,
  compact,
}) {
  if (loading) {
    return <Loader label="Loading photos…" />
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center text-red-800">
        <p className="font-semibold">Something went wrong</p>
        <p className="mt-2 text-sm opacity-90">{error}</p>
      </div>
    )
  }

  if (!photos?.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-navy-200 bg-navy-50/50 px-6 py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full border border-navy-200 bg-white text-navy-400">
          <ImageOff className="h-7 w-7" />
        </span>
        <p className="mt-4 text-lg font-semibold text-navy-950">{emptyTitle}</p>
        {emptyHint ? <p className="mt-2 max-w-md text-sm text-navy-600">{emptyHint}</p> : null}
      </div>
    )
  }

  const gridClass = compact
    ? 'grid grid-cols-3 gap-0.5 sm:gap-px md:gap-0.5'
    : 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'

  return (
    <div className={gridClass}>
      {photos.map((p) => (
        <PhotoCard key={p.id} photo={p} compact={compact} />
      ))}
    </div>
  )
}
