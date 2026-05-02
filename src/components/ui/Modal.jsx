import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'

export function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog overlay"
        className="absolute inset-0 bg-navy-950/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-lg rounded-2xl border border-navy-100 bg-white p-6 shadow-xl shadow-navy-950/10"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          {title ? <h2 className="text-lg font-semibold text-navy-950">{title}</h2> : <span />}
          <Button type="button" variant="ghost" size="sm" className="!p-2" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="text-navy-800">{children}</div>
        {footer ? <div className="mt-6 flex justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  )
}
