// Client-side suppression of headless-browser analytics traffic. See po-ywf.
//
// Background: between 2026-06-30 and 2026-07-23 a headless Chrome farm sent ~5,000 sessions
// that each forged a `https://www.google.com/` referrer. Google Search Console recorded 193
// clicks for the same month — a 27x gap. PostHog's own bot classifier labelled every one of
// them "Regular", because the traffic ran a real browser engine: it executed JS and reported
// Core Web Vitals. Two fingerprints showed up:
//
//   A  screen 1920x1080, viewport 1919x992   — 4,848 sessions, byte-identical across 60+ cities
//   B  screen 800x600,   viewport 1920x993   — 161 sessions, viewport LARGER than the screen
//
// This module is the cheap first layer: it stops naive automation at the source so it never
// reaches ingestion. It is deliberately NOT the primary control — fingerprint A would have
// slipped past every check here, since `navigator.webdriver` can be patched and its user agent
// was a plain `Chrome/149.0.0.0`. The authoritative control is the query-time exclusion in the
// PostHog project's "internal and test users" filters, which is retroactive and can be
// retargeted when a fingerprint shifts. See docs/analytics-bot-filtering.md.
//
// Every rule below must be a signal no real visitor can produce. A false positive here is
// silent, permanent data loss, so prefer under-blocking over clever heuristics.

import type { BeforeSendFn, CaptureResult } from 'posthog-js'

// A 800x600 display is extinct on the modern web and is the default virtual screen for a
// headless browser started without an explicit window size. In this project's own data every
// 800x600 session across seven months was single-pageview with no engagement events.
const HEADLESS_DEFAULT_SCREEN = { width: 800, height: 600 }

/**
 * True when the current browser is almost certainly automated.
 *
 * Intentionally narrow. Notably absent: a general "viewport bigger than screen" rule — mobile
 * browsers legitimately report `innerWidth` above `screen.width` when a page sets a fixed
 * viewport, so that check trades a real bot for real users.
 */
export function isAutomatedClient(win: Window = window): boolean {
  const nav = win.navigator
  if (!nav) return false

  // Set by WebDriver-controlled sessions (Puppeteer, Playwright, Selenium). Patchable by
  // stealth plugins, so treat a false here as "unknown", never as "human".
  if (nav.webdriver === true) return true

  // Chrome's own headless marker, plus the generic token other engines use.
  if (/Headless/i.test(nav.userAgent ?? '')) return true

  const screen = win.screen
  if (
    screen &&
    screen.width === HEADLESS_DEFAULT_SCREEN.width &&
    screen.height === HEADLESS_DEFAULT_SCREEN.height
  ) {
    return true
  }

  return false
}

/**
 * posthog-js `before_send` hook: returns the event unchanged for real visitors, or `null` to
 * drop it. Evaluated once per event, so the automation check is memoised per page load.
 */
export function createBotFilter(win?: Window): BeforeSendFn {
  let automated: boolean | null = null

  return function dropAutomatedEvents(event: CaptureResult | null): CaptureResult | null {
    if (typeof window === 'undefined') return event
    if (automated === null) automated = isAutomatedClient(win ?? window)
    return automated ? null : event
  }
}
