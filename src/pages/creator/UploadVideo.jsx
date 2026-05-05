import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import * as videoService from '../../services/videoService'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { VideoUploadForm } from '../../components/video/VideoUploadForm'

export function UploadVideo() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleUpload = async (formData) => {
    setLoading(true)
    try {
      const created = await videoService.createVideo(formData)
      toast.success('Video post published')
      if (created?.id) navigate(`/videos/${created.id}`)
      else navigate('/creator/videos')
    } catch (e) {
      const msg =
        e.response?.data?.detail ||
        (typeof e.response?.data === 'object' && JSON.stringify(e.response.data)) ||
        'Upload failed'
      toast.error(typeof msg === 'string' ? msg : 'Upload failed')
      throw e
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout
      title="New video post"
      description="Upload one or multiple videos in one post. You can edit metadata later."
    >
      <VideoUploadForm onSubmit={handleUpload} loading={loading} />
    </DashboardLayout>
  )
}
