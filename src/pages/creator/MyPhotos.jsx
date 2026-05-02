import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Pencil, Trash2 } from 'lucide-react'
import * as photoService from '../../services/photoService'
import { normalizeList, photoImageUrl } from '../../lib/apiHelpers'
import { useAppSelector } from '../../store/hooks'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { PhotoGrid } from '../../components/photo/PhotoGrid'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
export function MyPhotos() {
  const { user } = useAppSelector((s) => s.auth)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const uid = user?.id ?? user?.pk

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (uid == null) {
        setPhotos([])
        return
      }
      const data = await photoService.listPhotos({ creator: uid })
      setPhotos(normalizeList(data))
    } catch (e) {
      setError(e.response?.data?.detail || e.message || 'Failed to load photos')
      setPhotos([])
    } finally {
      setLoading(false)
    }
  }, [uid])

  useEffect(() => {
    load()
  }, [load])

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await photoService.deletePhoto(pendingDelete.id)
      toast.success('Photo deleted')
      setPendingDelete(null)
      await load()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Could not delete photo')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <DashboardLayout
      title="Your uploads"
      description="Edit or remove posts. Updates apply everywhere they appear."
    >
      <div className="mb-6 flex justify-end">
        <Link to="/creator/upload">
          <Button>New upload</Button>
        </Link>
      </div>

      {loading || error ? (
        <PhotoGrid photos={photos} loading={loading} error={error} />
      ) : (
        <div className="space-y-6">
          {!photos.length ? (
            <PhotoGrid
              photos={[]}
              loading={false}
              error={null}
              emptyTitle="No uploads yet"
              emptyHint="Start by publishing your first photo from the upload page."
            />
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((p) => {
                const src = photoImageUrl(p)
                const title = p.title || 'Untitled'
                return (
                  <li
                    key={p.id}
                    className="overflow-hidden rounded-xl border border-navy-100 bg-white shadow-sm"
                  >
                    <div className="relative aspect-[4/3] bg-navy-50">
                      {src ? (
                        <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-navy-400">
                          No preview
                        </div>
                      )}
                    </div>
                    <div className="space-y-3 p-4">
                      <p className="line-clamp-1 font-semibold text-navy-950">{title}</p>
                      <div className="flex flex-wrap gap-2">
                        <Link to={`/photos/${p.id}`} className="flex-1 min-w-[100px]">
                          <Button variant="secondary" className="w-full" size="sm">
                            View
                          </Button>
                        </Link>
                        <Link to={`/photos/${p.id}`} className="flex-1 min-w-[100px]">
                          <Button variant="ghost" className="w-full" size="sm">
                            <Pencil className="h-4 w-4" />
                            Details
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          className="flex-1 min-w-[100px]"
                          onClick={() => setPendingDelete(p)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete photo?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-navy-600">
          This removes <span className="font-semibold">{pendingDelete?.title || 'this photo'}</span>{' '}
          from PhotoShare Cloud. This action cannot be undone.
        </p>
      </Modal>
    </DashboardLayout>
  )
}
