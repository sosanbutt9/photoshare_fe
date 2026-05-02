import { Link } from 'react-router-dom'
import { ArrowRight, Camera, MessageCircle, Shield, Sparkles } from 'lucide-react'
import { Button } from '../components/ui/Button'

export function Home() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden border-b border-navy-100">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgb(30_53_82_/_0.08),transparent_50%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-navy-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-navy-800">
              <Sparkles className="h-3.5 w-3.5" />
              PhotoShare Cloud
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-navy-950 sm:text-5xl lg:text-[3.25rem] lg:leading-tight">
              Share moments in a{' '}
              <span className="bg-gradient-to-r from-navy-700 to-navy-950 bg-clip-text text-transparent">
                clean feed
              </span>
            </h1>
            <p className="mt-6 text-base leading-relaxed text-navy-600 sm:text-lg">
              Discover photos in an Instagram-style grid, publish as a creator, and keep the community
              vibrant — built on a navy & white theme you can read all day.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link to="/explore">
                <Button size="lg" className="gap-2 font-semibold">
                  Explore photos
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="secondary" className="font-semibold">
                  Sign up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-xl border border-navy-100 bg-white p-6 shadow-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-950 text-white">
              <Camera className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-base font-semibold text-navy-950">Creators</h2>
            <p className="mt-2 text-sm leading-relaxed text-navy-600">
              Upload from the dashboard and see your work in your profile grid — same rhythm as a social
              feed.
            </p>
          </div>
          <div className="rounded-xl border border-navy-100 bg-white p-6 shadow-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-navy-200 bg-navy-50 text-navy-900">
              <MessageCircle className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-base font-semibold text-navy-950">Community</h2>
            <p className="mt-2 text-sm leading-relaxed text-navy-600">
              Rate shots and join the discussion — tuned for quick scanning on Explore.
            </p>
          </div>
          <div className="rounded-xl border border-navy-100 bg-white p-6 shadow-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-100 text-navy-900">
              <Shield className="h-5 w-5" />
            </span>
            <h2 className="mt-4 text-base font-semibold text-navy-950">Admins</h2>
            <p className="mt-2 text-sm leading-relaxed text-navy-600">
              Monitor growth and engagement from a focused operations panel.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
