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
//   3. and that the destination is signup-CAPABLE, not merely a valid route —
//      for /build that means the page still posts to Arc's email-start endpoint
//      AND still emits the funnel events that let us see it working.
//
// It deliberately does NOT assert WHICH destination is used. /build (AI-native, the
// current strategy) and cloud/auth/signup (the older Cloud funnel) are both accepted.
// Product direction is allowed to change; having no signup path at all is not.
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
const BUILD = 'pages/build.tsx'
const APP = 'pages/_app.tsx'

// A destination counts as signup-capable if it is the /build page (verified below to
// still carry a working signup form) or a Cloud auth signup URL.
const BUILD_ROUTE = '/build'
const CLOUD_SIGNUP = /cloud\.portaljs\.com\/auth\/signup/

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

function leadsToSignup(src) {
  const s = inlineConsts(src)
  return {
    build: s.includes(`href="${BUILD_ROUTE}"`) || s.includes(`href='${BUILD_ROUTE}'`) || s.includes(`'${BUILD_ROUTE}?`) || s.includes(`'${BUILD_ROUTE}'`),
    cloud: CLOUD_SIGNUP.test(s),
  }
}

// ---------------------------------------------------------------- nav + hero

const nav = read(NAV)
if (nav) {
  const dest = leadsToSignup(nav)
  check(
    'navbar has a primary CTA to a signup-capable destination',
    dest.build || dest.cloud,
    `${NAV} links to neither ${BUILD_ROUTE} nor a cloud/auth/signup URL. The navbar CTA is the site-wide entry to the funnel; without it the only way in is /pricing (po-506).`,
  )
}

const hero = read(HERO)
if (hero) {
  const dest = leadsToSignup(hero)
  check(
    'landing hero has a primary CTA to a signup-capable destination',
    dest.build || dest.cloud,
    `${HERO} links to neither ${BUILD_ROUTE} nor a cloud/auth/signup URL. This is exactly what po-oh0 did: a hero that reads well and converts nothing.`,
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
  console.error('  The primary conversion path is unhooked. See po-506 / po-6el before changing this.\n')
  process.exit(1)
}

console.log(`✓ signup path intact — ${checks.length} assertions (nav CTA, hero CTA, /build signup + funnel events)`)
