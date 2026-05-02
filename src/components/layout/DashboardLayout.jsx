/** Full-width content — no sidebar (Instagram-style app shell uses bottom nav only). */
export function DashboardLayout({
  title,
  description,
  children,
  maxWidthClassName = 'max-w-2xl',
  headingClassName = '',
}) {
  return (
    <div className={`mx-auto w-full px-4 py-6 sm:px-6 ${maxWidthClassName}`}>
      {title ? (
        <header className="mb-6 border-b border-navy-100 pb-4">
          <h1
            className={
              headingClassName ||
              'text-lg font-semibold tracking-tight text-navy-950'
            }
          >
            {title}
          </h1>
          {description ? <p className="mt-1 text-xs leading-relaxed text-navy-600">{description}</p> : null}
        </header>
      ) : null}
      {children}
    </div>
  )
}
