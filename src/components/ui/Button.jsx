import { forwardRef } from 'react'

const variants = {
  primary:
    'bg-navy-900 text-white hover:bg-navy-950 shadow-sm shadow-navy-900/20 focus-visible:ring-navy-600',
  secondary:
    'bg-white text-navy-900 border border-navy-200 hover:bg-navy-50 focus-visible:ring-navy-400',
  ghost: 'bg-transparent text-navy-800 hover:bg-navy-50 focus-visible:ring-navy-400',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm font-medium rounded-xl',
  lg: 'px-5 py-3 text-base font-medium rounded-xl',
}

export const Button = forwardRef(function Button(
  {
    className = '',
    variant = 'primary',
    size = 'md',
    type = 'button',
    disabled,
    loading,
    children,
    ...rest
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className,
      ].join(' ')}
      {...rest}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  )
})
