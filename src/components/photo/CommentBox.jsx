import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MessageSquarePlus } from 'lucide-react'
import { Button } from '../ui/Button'

const schema = z.object({
  body: z.string().min(1, 'Write a comment').max(2000, 'Too long'),
})

export function CommentBox({ onSubmit, disabled, loading }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { body: '' },
  })

  const submit = handleSubmit(async (values) => {
    await onSubmit?.(values)
    reset()
  })

  return (
    <form onSubmit={submit} className="rounded-xl border border-navy-100 bg-white p-4 shadow-sm">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-navy-950">
        <MessageSquarePlus className="h-4 w-4 text-navy-700" aria-hidden />
        Add a comment
      </p>
      <label htmlFor="comment-body" className="sr-only">
        Comment
      </label>
      <textarea
        id="comment-body"
        rows={4}
        placeholder="Say something about this photo…"
        disabled={disabled || loading}
        className="w-full rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm text-navy-950 shadow-sm transition placeholder:text-navy-400 focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-600/20 disabled:opacity-50"
        {...register('body')}
      />
      {errors.body?.message ? (
        <p className="mt-1 text-sm text-red-600">{errors.body.message}</p>
      ) : null}
      <div className="mt-3 flex justify-end">
        <Button type="submit" size="sm" className="font-semibold" disabled={disabled} loading={loading}>
          Post
        </Button>
      </div>
    </form>
  )
}
