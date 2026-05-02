import { forwardRef } from 'react'

export const Input = forwardRef(function Input(
  { className = '', label, error, id, hint, icon: Icon, inputClassName = '', ...props },
  ref
) {
  const inputId = id || props.name
  const hasIcon = Boolean(Icon)

  return (
    <div className="w-full text-left">
      {label ? (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-navy-800">
          {label}
        </label>
      ) : null}
      <div className="relative">
        {hasIcon ? (
          <span
            className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-navy-400"
            aria-hidden
          >
            <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
          </span>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full rounded-xl border bg-white py-2.5 text-navy-950 shadow-sm transition placeholder:text-navy-400 focus:border-navy-600 focus:outline-none focus:ring-2 focus:ring-navy-600/20',
            hasIcon ? 'pl-10 pr-3.5' : 'px-3.5',
            error ? 'border-red-300' : 'border-navy-200',
            inputClassName,
            className,
          ].join(' ')}
          {...props}
        />
      </div>
      {hint && !error ? <p className="mt-1 text-xs text-navy-600">{hint}</p> : null}
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  )
})
