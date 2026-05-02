import { Link } from 'react-router-dom'
import { Compass, Home, Search } from 'lucide-react'
import { Button } from '../components/ui/Button'

export function NotFound() {
  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-10rem)] max-w-lg flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <div
        className="pointer-events-none absolute inset-x-0 top-1/4 mx-auto h-40 w-72 rounded-full bg-navy-400/15 blur-3xl"
        aria-hidden
      />
      <div className="relative flex flex-col items-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-navy-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-navy-800">
          <Compass className="h-3.5 w-3.5" aria-hidden />
          404
        </span>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-navy-950 sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-navy-600">
          This link may be wrong or the page moved. Head home or open Explore.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link to="/">
            <Button className="gap-2 px-6 font-semibold shadow-md shadow-navy-900/10">
              <Home className="h-4 w-4" aria-hidden />
              Home
            </Button>
          </Link>
          <Link to="/explore">
            <Button variant="secondary" className="gap-2 px-6 font-semibold">
              <Search className="h-4 w-4" aria-hidden />
              Explore
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
