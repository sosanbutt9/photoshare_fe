import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import * as photoService from '../../services/photoService'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { PhotoUploadForm } from '../../components/photo/PhotoUploadForm'
import { Button } from '../../components/ui/Button'
export function UploadPhoto() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleUpload = async (formData) => {
    setLoading(true)
    try {
      const created = await photoService.createPhoto(formData)
      toast.success('Post published')
      if (created?.id) navigate(`/photos/${created.id}`)
      else navigate('/creator/photos')
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
      title="New post"
      description="Share one photo or a carousel — your cover image shows on Explore and your profile grid."
    >
      <div className="mx-auto mb-4 flex max-w-xl justify-end">
        <Link to="/creator/videos/upload">
          <Button variant="secondary" size="sm">
            Switch to video upload
          </Button>
        </Link>
      </div>
      <PhotoUploadForm onSubmit={handleUpload} loading={loading} />
    </DashboardLayout>
  )
}
