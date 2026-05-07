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
import { Input } from '../../components/ui/Input'
export function MyPhotos() {
  const { user } = useAppSelector((s) => s.auth)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', caption: '', location: '', people_present: '' })
  const [editImageFiles, setEditImageFiles] = useState([])
  const [editImageKey, setEditImageKey] = useState(0)

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

  const openEdit = (photo) => {
    setEditing(photo)
    setEditImageFiles([])
    setEditImageKey((k) => k + 1)
    setForm({
      title: photo?.title || '',
      caption: photo?.caption || '',
      location: photo?.location || '',
      people_present: photo?.people_present || '',
    })
  }

  const closeEdit = () => {
    setEditing(null)
    setEditImageFiles([])
    setEditImageKey((k) => k + 1)
  }

  const saveEdit = async () => {
    if (!editing?.id) return
    setSaving(true)
    try {
      await photoService.updatePhoto(editing.id, { ...form, imageFiles: editImageFiles })
      toast.success('Post updated')
      closeEdit()
      await load()
    } catch (e) {
      const msg =
        e.response?.data?.detail ||
        (typeof e.response?.data === 'object' && JSON.stringify(e.response.data)) ||
        'Could not update post'
      toast.error(typeof msg === 'string' ? msg : 'Could not update post')
    } finally {
      setSaving(false)
    }
  }

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
                        <Button
                          variant="ghost"
                          className="flex-1 min-w-[100px]"
                          size="sm"
                          onClick={() => openEdit(p)}
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
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
        open={Boolean(editing)}
        onClose={closeEdit}
        title="Edit post"
        footer={
          <>
            <Button variant="secondary" onClick={closeEdit}>
              Cancel
            </Button>
            <Button loading={saving} onClick={saveEdit}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Title"
          />
          <div className="w-full text-left">
            <label htmlFor="edit-photo-caption" className="mb-1.5 block text-sm font-medium text-navy-800">
              Caption
            </label>
            <textarea
              id="edit-photo-caption"
              rows={3}
              value={form.caption}
              onChange={(e) => setForm((prev) => ({ ...prev, caption: e.target.value }))}
              className="w-full rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-950 shadow-sm placeholder:text-navy-400 focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-600/20"
            />
          </div>
          <Input
            label="Location"
            value={form.location}
            onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
            placeholder="Location"
          />
          <Input
            label="People present"
            value={form.people_present}
            onChange={(e) => setForm((prev) => ({ ...prev, people_present: e.target.value }))}
            placeholder="People present"
          />
          <div className="text-left">
            <label htmlFor="edit-photo-images" className="mb-1.5 block text-sm font-medium text-navy-800">
              Replace images
            </label>
            <input
              key={editImageKey}
              id="edit-photo-images"
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
              Optional — first file becomes the cover; you can select up to 10 images to replace the whole carousel.
            </p>
            {editImageFiles.length ? (
              <p className="mt-1 text-xs font-medium text-navy-700">{editImageFiles.length} file(s) selected</p>
            ) : null}
          </div>
        </div>
      </Modal>

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
