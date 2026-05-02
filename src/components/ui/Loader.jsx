export function Loader({ label = 'Loading…', className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-12 text-navy-700 ${className}`}
    >
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-navy-100 border-t-navy-700"
        aria-hidden
      />
      <p className="text-sm font-medium">{label}</p>
    </div>
  )
}
