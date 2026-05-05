export function StatsCard({ label, value, hint, icon: Icon, valueClassName = '' }) {
  return (
    <div className="rounded-xl border border-navy-100 bg-white p-5 shadow-sm transition hover:border-navy-200 hover:shadow-md">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-navy-600">{label}</p>
          <p
            className={`mt-2 text-xl font-semibold leading-snug tracking-tight text-navy-950 sm:text-2xl break-words [overflow-wrap:anywhere] ${valueClassName}`}
          >
            {value}
          </p>
          {hint ? <p className="mt-1 text-xs leading-relaxed text-navy-500">{hint}</p> : null}
        </div>
        {Icon ? (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-navy-50 to-navy-100/80 text-navy-800 ring-1 ring-navy-100">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
        ) : null}
      </div>
    </div>
  )
}
