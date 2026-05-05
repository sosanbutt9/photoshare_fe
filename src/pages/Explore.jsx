import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import * as photoService from '../services/photoService'
import * as videoService from '../services/videoService'
import { normalizeList } from '../lib/apiHelpers'
import { PhotoGrid } from '../components/photo/PhotoGrid'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export function Explore() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const [query, setQuery] = useState(q)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [photoData, videoData] = q.trim()
        ? await Promise.all([photoService.searchPhotos(q.trim()), videoService.searchVideos(q.trim())])
        : await Promise.all([photoService.listPhotos(), videoService.listVideos()])

      const photos = normalizeList(photoData).map((p) => ({ ...p, __kind: 'photo' }))
      const videos = normalizeList(videoData).map((v) => ({ ...v, __kind: 'video' }))
      const merged = [...photos, ...videos].sort((a, b) => {
        const ad = new Date(a.created_at || a.updated_at || 0).getTime()
        const bd = new Date(b.created_at || b.updated_at || 0).getTime()
        return bd - ad
      })
      setPhotos(merged)
    } catch (e) {
      setError(e.response?.data?.detail || e.message || 'Failed to load posts')
      setPhotos([])
    } finally {
      setLoading(false)
    }
  }, [q])

  useEffect(() => {
    setQuery(q)
  }, [q])

  useEffect(() => {
    load()
  }, [load])

  const applySearch = (e) => {
    e.preventDefault()
    const next = query.trim()
    if (next) setParams({ q: next })
    else setParams({})
  }

  return (
    <div className="mx-auto max-w-[935px] px-2 pb-12 pt-4 sm:px-4 lg:px-6">
      <div className="mb-6 flex flex-col items-center gap-4 border-b border-navy-100 pb-6 sm:flex-row sm:justify-between">
        <div className="text-center sm:text-left">
          <h1 className="text-lg font-semibold tracking-tight text-navy-950 sm:text-xl">Explore</h1>
          <p className="mt-1 text-xs text-navy-600 sm:text-sm">
            Search or scroll the grid — photos and videos are mixed like an Instagram feed.
          </p>
        </div>
        <form onSubmit={applySearch} className="flex w-full max-w-xs gap-2 sm:max-w-sm">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
            <Input
              className="!pl-10 !py-2 text-sm"
              placeholder="Search…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search query"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" className="shrink-0 px-4 font-semibold">
            Search
          </Button>
        </form>
      </div>

      <PhotoGrid
        photos={photos}
        loading={loading}
        error={error}
        compact
        emptyTitle={q ? 'No matches for your search' : 'No posts to show yet'}
        emptyHint={
          q
            ? 'Try another keyword or clear search to see everything.'
            : 'Check back soon — creators may still be publishing.'
        }
      />
    </div>
  )
}
