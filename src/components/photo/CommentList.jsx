import { Trash2, User } from 'lucide-react'
import { Button } from '../ui/Button'
import { normalizeRole } from '../../lib/apiHelpers'

function commentAuthor(c) {
  return c.author_username || c.user?.username || c.author?.username || 'User'
}

function commentBody(c) {
  return c.body || c.text || c.content || ''
}

export function CommentList({ comments, currentUser, onDelete, deletingId }) {
  const role = normalizeRole(currentUser?.role)
  const uid = currentUser?.id ?? currentUser?.pk

  if (!comments?.length) {
    return (
      <div className="rounded-xl border border-dashed border-navy-200 bg-navy-50/40 px-4 py-8 text-center text-sm text-navy-600">
        No comments yet. Be the first to share feedback.
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {comments.map((c) => {
        const authorId = c.user_id ?? c.user?.id ?? c.author?.id
        const canDelete =
          (uid != null && authorId != null && Number(authorId) === Number(uid)) || role === 'admin'
        return (
          <li
            key={c.id}
            className="flex gap-3 rounded-xl border border-navy-100 bg-white p-4 shadow-sm"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-100 text-navy-800">
              <User className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1 text-left">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-navy-950">{commentAuthor(c)}</p>
                {canDelete ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="!p-2 text-red-600 hover:bg-red-50"
                    loading={deletingId === c.id}
                    disabled={deletingId != null && deletingId !== c.id}
                    onClick={() => onDelete?.(c.id)}
                    aria-label="Delete comment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm text-navy-800">{commentBody(c)}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
