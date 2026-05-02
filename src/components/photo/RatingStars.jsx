import { Star } from 'lucide-react'

export function RatingStars({
  value = 0,
  onChange,
  disabled,
  max = 5,
  size = 'md',
  readOnly,
}) {
  const interactive = Boolean(onChange) && !disabled && !readOnly
  const starSize = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'

  return (
    <div
      className="inline-flex items-center gap-1"
      role={interactive ? 'radiogroup' : undefined}
      aria-label="Rating"
    >
      {Array.from({ length: max }, (_, i) => {
        const score = i + 1
        const filled = value >= score
        return (
          <button
            key={score}
            type="button"
            disabled={!interactive}
            className={[
              'rounded-md p-0.5 transition',
              interactive
                ? 'hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy-600'
                : '',
              !interactive ? 'cursor-default' : '',
            ].join(' ')}
            onClick={() => interactive && onChange?.(score)}
            aria-checked={filled}
            role={interactive ? 'radio' : undefined}
          >
            <Star
              className={[
                starSize,
                filled ? 'text-amber-500' : 'text-navy-200',
                interactive ? '' : '',
              ].join(' ')}
              fill={filled ? 'currentColor' : 'none'}
              strokeWidth={1.5}
            />
          </button>
        )
      })}
    </div>
  )
}
