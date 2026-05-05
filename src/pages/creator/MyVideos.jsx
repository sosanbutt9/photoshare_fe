import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Pencil, Trash2 } from 'lucide-react'
import * as videoService from '../../services/videoService'
import { normalizeList, videoFileUrl } from '../../lib/apiHelpers'
import { useAppSelector } from '../../store/hooks'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'

export function MyVideos() {
  const { user } = useAppSelector((s) => s.auth)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', caption: '', location: '', people_present: '' })

  const uid = user?.id ?? user?.pk

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (uid == null) {
        setVideos([])
        return
      }
      const data = await videoService.listVideos({ creator: uid })
      setVideos(normalizeList(data))
    } catch (e) {
      setError(e.response?.data?.detail || e.message || 'Failed to load videos')
      setVideos([])
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
      await videoService.deleteVideo(pendingDelete.id)
      toast.success('Video deleted')
      setPendingDelete(null)
      await load()
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Could not delete video')
    } finally {
      setDeleting(false)
    }
  }

  const openEdit = (video) => {
    setEditing(video)
    setForm({
      title: video?.title || '',
      caption: video?.caption || '',
      location: video?.location || '',
      people_present: video?.people_present || '',
    })
  }

  const saveEdit = async () => {
    if (!editing?.id) return
    setSaving(true)
    try {
      await videoService.updateVideo(editing.id, form)
      toast.success('Video updated')
      setEditing(null)
      await load()
    } catch (e) {
      const msg =
        e.response?.data?.detail ||
        (typeof e.response?.data === 'object' && JSON.stringify(e.response.data)) ||
        'Could not update video'
      toast.error(typeof msg === 'string' ? msg : 'Could not update video')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout title="Your videos" description="Manage your uploaded videos.">
      <div className="mb-6 flex justify-end">
        <Link to="/creator/videos/upload">
          <Button>New video upload</Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-navy-500">Loading videos…</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : !videos.length ? (
        <div className="rounded-xl border border-dashed border-navy-200 bg-navy-50/40 p-8 text-center">
          <p className="text-base font-semibold text-navy-950">No videos yet</p>
          <p className="mt-1 text-sm text-navy-600">Upload your first video post from the button above.</p>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => {
            const src = videoFileUrl(v)
            const title = v.title || 'Untitled'
            return (
              <li key={v.id} className="overflow-hidden rounded-xl border border-navy-100 bg-white shadow-sm">
                <div className="relative aspect-[4/3] bg-navy-50">
                  {src ? (
                    <video src={src} className="h-full w-full object-cover" preload="metadata" muted />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-navy-400">No preview</div>
                  )}
                </div>
                <div className="space-y-3 p-4">
                  <p className="line-clamp-1 font-semibold text-navy-950">{title}</p>
                  <div className="flex flex-wrap gap-2">
                    <Link to={`/videos/${v.id}`} className="flex-1 min-w-[100px]">
                      <Button variant="secondary" className="w-full" size="sm">
                        View
                      </Button>
                    </Link>
                    <Button variant="ghost" className="flex-1 min-w-[100px]" size="sm" onClick={() => openEdit(v)}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      className="flex-1 min-w-[100px]"
                      onClick={() => setPendingDelete(v)}
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

      <Modal
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete video?"
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
          This removes <span className="font-semibold">{pendingDelete?.title || 'this video'}</span> permanently.
        </p>
      </Modal>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title="Edit video"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>
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
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="Video title"
          />
          <div className="w-full text-left">
            <label htmlFor="edit-video-caption" className="mb-1.5 block text-sm font-medium text-navy-800">
              Caption
            </label>
            <textarea
              id="edit-video-caption"
              rows={3}
              value={form.caption}
              onChange={(e) => setForm((p) => ({ ...p, caption: e.target.value }))}
              className="w-full rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-950 shadow-sm placeholder:text-navy-400 focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-600/20"
            />
          </div>
          <Input
            label="Location"
            value={form.location}
            onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
            placeholder="Location"
          />
          <Input
            label="People present"
            value={form.people_present}
            onChange={(e) => setForm((p) => ({ ...p, people_present: e.target.value }))}
            placeholder="People present"
          />
        </div>
      </Modal>
    </DashboardLayout>
  )
}
