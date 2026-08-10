// Named CTA analytics. Prefer these over DOM autocapture: they survive redesigns
// and give clean funnel/trend building blocks in PostHog (event contract: po-607).
//
// Every conversion CTA on the site must call this. An untracked CTA is invisible
// in attribution, and invisible CTAs are how po-80u happened: the navbar button
// was the single biggest source of /build arrivals from the homepage and emitted
// nothing, so a month of analysis credited the hero for clicks it never got.
import posthog from 'posthog-js'

export function track(event: string, props?: Record<string, unknown>) {
  try {
    posthog.capture(event, props)
  } catch (_) {
    // never let analytics break a CTA
  }
}
