import Layout from '@/components/Layout'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import posthog from 'posthog-js'

// The Book a demo CTA used to link straight to calendar.app.google, which can't be
// tagged — every booking was invisible to attribution (po-frh). CTAs now route
// through here: we fire a conversion event, then redirect to the real calendar.
// The booking itself is counted server-side: Twenty syncs each booking from Google Calendar
// and the arc-auth cron turns it into a `call_booked` PostHog event (da-55j.2,
// cloud/auth/src/bookings.ts). Renaming the "PortalJS meetings" schedule changes its event
// titles, so update BOOKING_SCHEDULES there too.
const CALENDAR_LINKS: Record<string, string> = {
  default: 'https://calendar.app.google/NDanMCA7ixtwcPXT7',
  partner: 'https://calendar.app.google/iQkon85iKURfdBtX7',
}

function track(event: string, props?: Record<string, unknown>) {
  try {
    posthog.capture(event, props)
  } catch (_) {
    // never let analytics break the redirect
  }
}

export default function BookADemo() {
  const router = useRouter()
  const to = typeof router.query.to === 'string' ? router.query.to : 'default'
  const source = typeof router.query.source === 'string' ? router.query.source : undefined
  const destination = CALENDAR_LINKS[to] ?? CALENDAR_LINKS.default
  // Outreach attribution passed through by /government (da-55j.7): ?prospect=<slug> and utm_*.
  const attribution = Object.fromEntries(
    Object.entries(router.query).filter(
      ([k, v]) => typeof v === 'string' && (k === 'prospect' || k.startsWith('utm_'))
    )
  )

  useEffect(() => {
    if (!router.isReady) return
    track('book_a_demo_redirect', { to, source, destination, ...attribution })
    window.location.replace(destination)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  return (
    <Layout
      isHomePage={false}
      title="Book a demo — PortalJS"
      description="Schedule a call with the PortalJS team."
    >
      <div className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-[17px] text-slate-600 dark:text-slate-400">
          Redirecting you to our booking calendar…{' '}
          <a href={destination} className="font-semibold text-blue-600 underline dark:text-blue-400">
            Click here if you are not redirected.
          </a>
        </p>
      </div>
    </Layout>
  )
}
