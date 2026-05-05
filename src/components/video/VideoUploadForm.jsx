import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlignLeft, Clapperboard, MapPin, Upload, Users } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

const MAX_FILES = 10

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Too long'),
  caption: z.string().max(5000, 'Too long').optional(),
  location: z.string().max(255, 'Too long').optional(),
  people_present: z.string().max(512, 'Too long').optional(),
  videos: z
    .any()
    .refine((v) => v instanceof FileList, { message: 'Choose one or more videos' })
    .refine((v) => v instanceof FileList && v.length >= 1, { message: 'Choose at least one video' })
    .refine((v) => !(v instanceof FileList) || v.length <= MAX_FILES, {
      message: `You can add up to ${MAX_FILES} videos per post`,
    }),
})

export function VideoUploadForm({ onSubmit, loading }) {
  const [fileInputKey, setFileInputKey] = useState(0)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { title: '', caption: '', location: '', people_present: '' },
  })

  const watchVideos = watch('videos')
  const fileCount = useMemo(() => {
    if (!(watchVideos instanceof FileList)) return 0
    return watchVideos.length
  }, [watchVideos])

  const submit = handleSubmit(async (values) => {
    const files = Array.from(values.videos)
    const formData = new FormData()
    formData.append('title', values.title)
    if (values.caption) formData.append('caption', values.caption)
    if (values.location) formData.append('location', values.location)
    if (values.people_present) formData.append('people_present', values.people_present)
    files.forEach((file) => formData.append('videos', file))
    await onSubmit?.(formData)
    reset()
    setFileInputKey((k) => k + 1)
  })

  return (
    <form
      onSubmit={submit}
      className="mx-auto max-w-xl space-y-5 rounded-xl border border-navy-100 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-950 text-white shadow-md shadow-navy-900/25">
          <Upload className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-navy-950">New video post</h2>
          <p className="text-sm text-navy-600">Upload one or multiple videos (up to {MAX_FILES}).</p>
        </div>
      </div>

      <Input
        label="Title"
        placeholder="e.g. Behind the scenes"
        icon={AlignLeft}
        error={errors.title?.message}
        {...register('title')}
      />

      <div className="w-full text-left">
        <label htmlFor="video-caption" className="mb-1.5 block text-sm font-medium text-navy-800">
          Caption
        </label>
        <textarea
          id="video-caption"
          rows={4}
          placeholder="Tell people about this video…"
          className="w-full rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-950 shadow-sm placeholder:text-navy-400 focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-600/20"
          {...register('caption')}
        />
        {errors.caption?.message ? <p className="mt-1 text-sm text-red-600">{errors.caption.message}</p> : null}
      </div>

      <Input
        label="Location (optional)"
        placeholder="City or region"
        icon={MapPin}
        error={errors.location?.message}
        {...register('location')}
      />
      <Input
        label="People present (optional)"
        placeholder="Who appears in this video?"
        icon={Users}
        error={errors.people_present?.message}
        {...register('people_present')}
      />

      <div className="w-full text-left">
        <label htmlFor="video-files" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-navy-800">
          <Clapperboard className="h-4 w-4 text-navy-600" aria-hidden />
          Videos
          {fileCount > 0 ? <span className="font-normal text-navy-500">({fileCount} selected)</span> : null}
        </label>
        <input
          key={fileInputKey}
          id="video-files"
          type="file"
          multiple
          accept="video/*"
          className="block w-full text-sm text-navy-600 file:mr-4 file:rounded-lg file:border-0 file:bg-navy-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-navy-900 hover:file:bg-navy-100"
          {...register('videos')}
        />
        {errors.videos?.message ? <p className="mt-1 text-sm text-red-600">{String(errors.videos.message)}</p> : null}
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading} className="font-semibold">
          Share videos
        </Button>
      </div>
    </form>
  )
}
