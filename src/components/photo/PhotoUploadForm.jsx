import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AlignLeft, Images, MapPin, Upload, Users } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

const MAX_FILES = 10

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Too long'),
  caption: z.string().max(5000, 'Too long').optional(),
  location: z.string().max(255, 'Too long').optional(),
  people_present: z.string().max(512, 'Too long').optional(),
  images: z
    .any()
    .refine((v) => v instanceof FileList, { message: 'Choose one or more images' })
    .refine((v) => v instanceof FileList && v.length >= 1, { message: 'Choose at least one image' })
    .refine((v) => !(v instanceof FileList) || v.length <= MAX_FILES, {
      message: `You can add up to ${MAX_FILES} images per post`,
    }),
})

export function PhotoUploadForm({ onSubmit, loading }) {
  const [previewUrls, setPreviewUrls] = useState([])
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

  const watchImages = watch('images')

  useEffect(() => {
    if (!(watchImages instanceof FileList) || watchImages.length === 0) {
      setPreviewUrls((prev) => {
        prev.forEach((u) => URL.revokeObjectURL(u))
        return []
      })
      return undefined
    }
    const urls = Array.from(watchImages).map((f) => URL.createObjectURL(f))
    setPreviewUrls((prev) => {
      prev.forEach((u) => URL.revokeObjectURL(u))
      return urls
    })
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [watchImages])

  const fileCount = useMemo(() => {
    if (!(watchImages instanceof FileList)) return 0
    return watchImages.length
  }, [watchImages])

  const submit = handleSubmit(async (values) => {
    const list = values.images
    const files = Array.from(list)
    const formData = new FormData()
    formData.append('title', values.title)
    if (values.caption) formData.append('caption', values.caption)
    if (values.location) formData.append('location', values.location)
    if (values.people_present) formData.append('people_present', values.people_present)
    files.forEach((file) => formData.append('images', file))
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
          <h2 className="text-lg font-semibold text-navy-950">New post</h2>
          <p className="text-sm text-navy-600">
            Pick one photo or several — carousel on the post page (JPEG or PNG, up to {MAX_FILES} images).
          </p>
        </div>
      </div>

      <Input
        label="Title"
        placeholder="e.g. Sunset over the bay"
        icon={AlignLeft}
        error={errors.title?.message}
        {...register('title')}
      />

      <div className="w-full text-left">
        <label htmlFor="photo-caption" className="mb-1.5 block text-sm font-medium text-navy-800">
          Caption
        </label>
        <textarea
          id="photo-caption"
          rows={4}
          placeholder="Tell the story behind the shot…"
          className="w-full rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-950 shadow-sm placeholder:text-navy-400 focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-600/20"
          {...register('caption')}
        />
        {errors.caption?.message ? (
          <p className="mt-1 text-sm text-red-600">{errors.caption.message}</p>
        ) : null}
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
        placeholder="Who appears in this shot?"
        icon={Users}
        error={errors.people_present?.message}
        {...register('people_present')}
      />

      <div className="w-full text-left">
        <label htmlFor="photo-files" className="mb-1.5 flex items-center gap-2 text-sm font-medium text-navy-800">
          <Images className="h-4 w-4 text-navy-600" aria-hidden />
          Photos
          {fileCount > 0 ? (
            <span className="font-normal text-navy-500">
              ({fileCount} selected{fileCount > 1 ? ', swipe on post' : ''})
            </span>
          ) : null}
        </label>
        <input
          key={fileInputKey}
          id="photo-files"
          type="file"
          multiple
          accept="image/*"
          className="block w-full text-sm text-navy-600 file:mr-4 file:rounded-lg file:border-0 file:bg-navy-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-navy-900 hover:file:bg-navy-100"
          {...register('images')}
        />
        {errors.images?.message ? (
          <p className="mt-1 text-sm text-red-600">{String(errors.images.message)}</p>
        ) : null}
        {previewUrls.length > 0 ? (
          <ul className="mt-3 flex gap-2 overflow-x-auto pb-1 pt-1">
            {previewUrls.map((url, i) => (
              <li
                key={`${url}-${i}`}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-navy-100 bg-navy-50"
              >
                <img src={url} alt="" className="h-full w-full object-cover" />
                {i === 0 ? (
                  <span className="absolute bottom-1 left-1 rounded bg-navy-950/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    Cover
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-navy-500">
            First image is the cover on Explore and your profile grid.
          </p>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading} className="font-semibold">
          Share
        </Button>
      </div>
    </form>
  )
}
