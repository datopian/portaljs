#!/usr/bin/env node
//
// check-signup-path.mjs — the funnel guard (po-6el).
//
// WHY THIS EXISTS
// On 2026-06-04, commit e5f67929 (po-oh0) rewrote the nav CTA from
// "Get started free" -> cloud/auth/signup into "PortalJS Cloud" -> the app root,
// and swapped the landing hero for one with no action CTA at all. Nothing failed:
// the site built, the pages rendered, every link worked. The only symptom was in
// PostHog a month later — cloud signup pageviews 102 -> 27 -> 13 while signin held
// and /pricing views ROSE, i.e. demand was unchanged and the path had been removed.
// A copy/positioning edit silently unhooked the primary conversion path for two
// months (po-506, po-6el).
//
// This script makes that class of change loud. It asserts, statically, that the two
// entry points still lead somewhere a visitor can actually sign up:
//
//   1. the navbar primary CTA           (site/components/Nav.tsx)
//   2. the landing hero primary CTA     (site/components/home/LandingHero.tsx)
//   3. the homepage's closing CTA band  (site/components/home/CtaBand.tsx)
//   4. and that the destination is signup-CAPABLE, not merely a valid route —
//      for /build that means the page still posts to Arc's email-start endpoint
//      AND still emits the funnel events that let us see it working.
//
// It also asserts two properties a link can lose without losing its href, both
// found by po-80u:
//
//   - the navbar CTA must be visible at EVERY breakpoint. It was
//     `hidden lg:inline-flex`, so mobile and tablet visitors (11% of homepage
//     traffic) had no route to /build below the hero.
//   - every CTA must still emit its named event. The navbar button was the single
//     largest source of homepage -> /build arrivals and tracked nothing, so a
//     month of funnel analysis credited the hero for clicks it never received.
//
// It deliberately does NOT assert WHICH destination is used. /build (AI-native),
// cloud/auth/signup (the older Cloud funnel), a booked call via /book-a-demo and the
// /government landing page are all accepted. Product direction is allowed to change;
// having no conversion path at all is not.
//
// da-55j.6 moved the site-wide CTAs from self-serve sign-up to booking a call: PortalJS's
// buyers are governments, and they book calls rather than sign up. So the guard also pins
// the call path: /book-a-demo must still redirect to the booking calendar and report the
// redirect, and /government must offer the call, report its CTAs, and NOT carry a
// self-serve sign-up (for that audience it is a dead end).
//
// Zero dependencies, so the merge gate can run it on a cold tree without installing
// site/'s lockfile. Usage:  node site/scripts/check-signup-path.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// --root lets check-signup-path-selftest.mjs point the guard at fixture trees and
// prove it actually fails on each regression it claims to catch.
const rootArg = process.argv.indexOf('--root')
const SITE =
  rootArg === -1
    ? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
    : path.resolve(process.argv[rootArg + 1] ?? '')

const NAV = 'components/Nav.tsx'
const HERO = 'components/home/LandingHero.tsx'
const CTA_BAND = 'components/home/CtaBand.tsx'
const BUILD = 'pages/build.tsx'
const APP = 'pages/_app.tsx'
const BOOK_DEMO = 'pages/book-a-demo.tsx'
const GOVERNMENT = 'pages/government.tsx'

// A destination counts as signup-capable if it is the /build page (verified below to
// still carry a working signup form) or a Cloud auth signup URL.
const BUILD_ROUTE = '/build'
const CLOUD_SIGNUP = /cloud\.portaljs\.com\/auth\/signup/
// Call-capable destinations (da-55j.6), each verified below to still lead to a booking.
const CALL_ROUTE = '/book-a-demo'
const GOVERNMENT_ROUTE = '/government'

const failures = []
const checks = []

function check(label, ok, detail) {
  checks.push(label)
  if (!ok) failures.push(`${label}\n      ${detail}`)
}

function read(rel) {
  const abs = path.join(SITE, rel)
  if (!fs.existsSync(abs)) {
    failures.push(`${rel} is missing\n      The funnel guard cannot verify a file that does not exist.`)
    return null
  }
  return fs.readFileSync(abs, 'utf8')
}

// Resolve `href={BUILD_ROUTE}` style references by inlining top-level string consts,
// so the guard reads the destination the same way the bundler does.
function inlineConsts(src) {
  let out = src
  for (const [, name, value] of src.matchAll(/^const\s+([A-Z0-9_]+)\s*=\s*'([^']*)'/gm)) {
    out = out.replaceAll(`{${name}}`, `'${value}'`).replaceAll(`(${name})`, `('${value}')`).replaceAll(
      `\`${'$'}{${name}}`,
      `\`${value}`,
    )
  }
  return out
}

function leadsToConversion(src) {
  const s = inlineConsts(src)
  const linksTo = (route) =>
    s.includes(`href="${route}"`) || s.includes(`href="${route}?`) || s.includes(`'${route}?`) || s.includes(`'${route}'`)
  const build = linksTo(BUILD_ROUTE)
  const cloud = CLOUD_SIGNUP.test(s)
  const call = linksTo(CALL_ROUTE)
  const government = linksTo(GOVERNMENT_ROUTE)
  return { build, cloud, call, government, any: build || cloud || call || government }
}

const DESTINATIONS = `${BUILD_ROUTE}, ${CALL_ROUTE}, ${GOVERNMENT_ROUTE} or a cloud/auth/signup URL`

// Return the opening JSX tag that carries `needle`, e.g. the whole
// `<Link href="/build" ... >` element start, so its props can be inspected.
// Scans to the first `>` at brace/quote depth zero rather than regexing, because
// a Tailwind className routinely contains both `>` and quotes.
function openingTag(src, needle) {
  const at = src.indexOf(needle)
  if (at === -1) return null
  const start = Math.max(src.lastIndexOf('<', at), 0)
  let depth = 0
  let quote = null
  for (let i = start; i < src.length; i++) {
    const c = src[i]
    if (quote) {
      if (c === quote) quote = null
      continue
    }
    if (c === '"' || c === "'" || c === '`') quote = c
    else if (c === '{') depth++
    else if (c === '}') depth--
    else if (c === '>' && depth === 0) return src.slice(start, i + 1)
  }
  return null
}

// True when a Tailwind class list hides the element at small viewports: a bare
// `hidden` that is only undone by a breakpoint-prefixed display utility.
function hiddenBelowBreakpoint(classNames) {
  return (
    /(^|[\s`'"{])hidden([\s`'"}]|$)/.test(classNames) &&
    /\b(sm|md|lg|xl|2xl):(inline-flex|inline-block|inline|flex|block|grid|table)\b/.test(classNames)
  )
}

// ---------------------------------------------------------------- nav + hero

const nav = read(NAV)
if (nav) {
  const dest = leadsToConversion(nav)
  check(
    'navbar has a primary CTA to a conversion destination',
    dest.any,
    `${NAV} links to none of ${DESTINATIONS}. The navbar CTA is the site-wide entry to the funnel; without it the only way in is /pricing (po-506).`,
  )

  // A CTA present only above `lg` is absent for every phone and most tablets —
  // 11% of homepage traffic, and for them the hero becomes the sole entry point.
  const cta =
    openingTag(nav, `href="${CALL_ROUTE}`) ??
    openingTag(nav, `href="${GOVERNMENT_ROUTE}"`) ??
    openingTag(nav, `href="${BUILD_ROUTE}"`) ??
    openingTag(nav, 'href="https://cloud.portaljs.com/auth/signup"')
  check(
    'navbar CTA is visible at every breakpoint',
    !cta || !hiddenBelowBreakpoint(cta),
    `${NAV}'s primary CTA is hidden below a Tailwind breakpoint. Mobile and tablet visitors then have no site-wide route into the funnel at all (po-80u).`,
  )

  // Untracked CTAs cannot be attributed, and unattributed CTAs get optimised
  // blind — po-80u spent a month crediting the hero for the navbar's clicks.
  check(
    'navbar CTA reports itself to analytics',
    !cta || /onClick=\{\(\) => track\(/.test(cta),
    `${NAV}'s primary CTA emits no named event. Attribution then guesses, and the wrong CTA gets redesigned (po-80u).`,
  )
}

const hero = read(HERO)
if (hero) {
  const dest = leadsToConversion(hero)
  check(
    'landing hero has a primary CTA to a conversion destination',
    dest.any,
    `${HERO} links to none of ${DESTINATIONS}. This is exactly what po-oh0 did: a hero that reads well and converts nothing.`,
  )
  // The hero CTA must be reachable in the DEFAULT state, not parked behind a mode
  // toggle the visitor has to find first.
  const defaultMode = /useState<'terminal' \| 'gui'>\('(\w+)'\)/.exec(hero)
  check(
    'landing hero CTA is visible in the default hero mode',
    !defaultMode || defaultMode[1] === 'gui',
    `${HERO} defaults to '${defaultMode?.[1]}' mode. The signup CTA lives in the 'gui' branch, so defaulting elsewhere hides it above the fold.`,
  )
}

// --------------------------------------------------------- homepage closing CTA

// The last slot on the page, seen by the reader who scrolled everything and is
// deciding now. It read "Build your data portal today." over a button that opened
// the docs in a new tab, while /build had exactly two entry points on the whole
// homepage (po-80u).
const band = read(CTA_BAND)
if (band) {
  const dest = leadsToConversion(band)
  check(
    'homepage closing CTA leads to a conversion destination',
    dest.any,
    `${CTA_BAND} links to none of ${DESTINATIONS}. A closing CTA that sends a decided reader to documentation converts nothing (po-80u).`,
  )

  // Order in the source is order on the page, so "first link in the JSX" is the
  // primary button. Compared inside the JSX only — the consts at the top of the
  // file would otherwise decide the answer regardless of what is rendered.
  const jsx = inlineConsts(band).slice(inlineConsts(band).indexOf('return ('))
  const convertAt = jsx.search(/href=["'{]?['"]?\/(build|book-a-demo|government)/)
  const docsAt = jsx.search(/portaljs\.com\/docs/)
  check(
    'the closing CTA primary button converts, not the docs',
    convertAt !== -1 && (docsAt === -1 || convertAt < docsAt),
    `${CTA_BAND} renders a docs link ahead of its conversion link. Whichever comes first is the primary button, and docs is where a reader goes to postpone deciding (po-80u).`,
  )

  check(
    'the closing CTA reports itself to analytics',
    /track\('home_cta_band_clicked'/.test(band),
    `${CTA_BAND} emits no named event, so its share of /build arrivals is invisible and the next funnel analysis will misattribute it (po-80u).`,
  )
}

// ------------------------------------------------- destination is really capable

const build = read(BUILD)
if (build) {
  check(
    '/build posts to the Arc email-start endpoint',
    /\/email\/start/.test(build),
    `${BUILD} no longer calls Arc's /email/start. The page can render a perfect form and still sign nobody up.`,
  )
  check(
    '/build renders a submitting form',
    /<form[^>]*onSubmit=\{submit\}/.test(build),
    `${BUILD} has no form wired to its submit handler.`,
  )

  // The funnel is only measurable if it still reports itself. po-6el spent its first
  // step ruling out "the event stopped firing" — pin the events so that question is
  // answered by the gate next time, not by a month of archaeology.
  for (const event of ['build_viewed', 'build_signup_submitted', 'build_email_sent', 'build_signup_error']) {
    check(
      `/build still emits ${event}`,
      new RegExp(`track\\('${event}'`).test(build),
      `${BUILD} no longer captures ${event}. Losing it makes the funnel unmeasurable at that step, which is how a 75% failure rate stayed invisible for four weeks (po-4nu).`,
    )
  }
  // build_signup_submitted must fire BEFORE the network call. Moving it into the
  // success path would silently redefine "submitted" as "succeeded" and hide outages.
  const submittedAt = build.indexOf("track('build_signup_submitted'")
  const fetchAt = build.indexOf('await fetch(')
  check(
    'build_signup_submitted fires before the Arc request',
    submittedAt !== -1 && fetchAt !== -1 && submittedAt < fetchAt,
    `${BUILD} captures build_signup_submitted at or after the fetch. It must fire on intent, otherwise a failing Arc erases the denominator and the funnel looks empty rather than broken.`,
  )
}

// ----------------------------------------------- the call path really books calls

// /book-a-demo is a redirect, not a page: it reports the click, then hands the visitor to
// the Google appointment calendar. Lose either half and every "Book a call" CTA on the
// site becomes a dead or invisible end (po-frh, da-55j.6).
const bookDemo = read(BOOK_DEMO)
if (bookDemo) {
  check(
    '/book-a-demo redirects to the booking calendar',
    /calendar\.app\.google\//.test(bookDemo) && /window\.location\.replace\(/.test(bookDemo),
    `${BOOK_DEMO} no longer redirects to a calendar.app.google booking link. Every "Book a call" CTA then ends on a page that books nothing.`,
  )
  check(
    '/book-a-demo still emits book_a_demo_redirect',
    /track\('book_a_demo_redirect'/.test(bookDemo),
    `${BOOK_DEMO} no longer captures book_a_demo_redirect, so call intent disappears from PostHog and calls booked can't be traced back to a CTA (po-frh).`,
  )
}

// /government is where government CTAs and outreach emails land (da-55j.5). It must
// offer the call, report its CTAs, and carry no self-serve sign-up (da-55j.6).
const gov = read(GOVERNMENT)
if (gov) {
  const g = leadsToConversion(gov)
  check(
    '/government offers a book-a-call link',
    g.call,
    `${GOVERNMENT} no longer links to ${CALL_ROUTE}. The government landing page then has no way to book the call it exists for.`,
  )
  check(
    '/government CTAs report themselves to analytics',
    /track\('government_cta_clicked'/.test(gov),
    `${GOVERNMENT} emits no government_cta_clicked event, so the government path can't be measured (da-55j.2).`,
  )
  check(
    '/government carries no self-serve sign-up',
    !g.build && !g.cloud && !/\/email\/start/.test(gov),
    `${GOVERNMENT} links to ${BUILD_ROUTE} or a sign-up flow. Government buyers book calls; a sign-up on this path is a dead end (da-55j.6).`,
  )
}

// ------------------------------------------------- the events can actually leave

// React runs a page's effects BEFORE _app's, so initialising PostHog from _app's
// useEffect drops any capture a page makes on first commit. That is not
// hypothetical: it cost /build a third of its build_viewed events (po-6el).
const app = read(APP)
if (app) {
  const initAt = app.indexOf('posthog.init(')
  const effectAt = app.indexOf('useEffect(')
  check(
    'PostHog is initialised at module scope, not from an effect',
    initAt !== -1 && (effectAt === -1 || initAt < effectAt),
    `${APP} calls posthog.init() inside/after a useEffect. Child effects run before parent effects, so any page capturing on first commit fires against an uninitialised SDK and the event is silently dropped.`,
  )
}

// ----------------------------------------------------------------------- report

if (failures.length) {
  console.error(`\n✖ signup path check FAILED — ${failures.length} of ${checks.length} assertion(s):\n`)
  for (const f of failures) console.error(`    - ${f}\n`)
  console.error('  The primary conversion path is unhooked. See po-506 / po-6el / da-55j.6 before changing this.\n')
  process.exit(1)
}

console.log(
  `✓ conversion path intact — ${checks.length} assertions (nav CTA, hero CTA, homepage closing CTA, /build signup + funnel events, /book-a-demo + /government call path)`,
)
