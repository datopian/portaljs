#!/usr/bin/env node
//
// check-signup-path-selftest.mjs — proves the funnel guard actually fails (po-6el).
//
// A guard that only ever passes is indistinguishable from no guard at all — the
// same failure mode scripts/verify.sh exists to prevent. So for every regression
// check-signup-path.mjs claims to catch, this builds a fixture tree containing
// exactly that regression and asserts the guard exits non-zero on it. It also
// asserts the guard passes on the real site/, so a green run means something.
//
// Usage:  node site/scripts/check-signup-path-selftest.mjs

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SITE = path.resolve(HERE, '..')
const GUARD = path.join(HERE, 'check-signup-path.mjs')

const FILES = [
  'components/Nav.tsx',
  'components/home/LandingHero.tsx',
  'components/home/CtaBand.tsx',
  'pages/build.tsx',
  'pages/_app.tsx',
]

function runGuard(root) {
  return spawnSync(process.execPath, [GUARD, '--root', root], { encoding: 'utf8' })
}

// A fixture is the real site with one file rewritten by `mutate`.
function fixture(name, mutate) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `signup-guard-${name}-`))
  for (const rel of FILES) {
    const dest = path.join(dir, rel)
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.writeFileSync(dest, fs.readFileSync(path.join(SITE, rel), 'utf8'))
  }
  mutate(dir)
  return dir
}

function edit(dir, rel, fn) {
  const abs = path.join(dir, rel)
  fs.writeFileSync(abs, fn(fs.readFileSync(abs, 'utf8')))
}

const cases = [
  // The original po-oh0 regression: nav CTA repointed away from any signup.
  [
    'nav CTA repointed at the app root',
    (d) => edit(d, 'components/Nav.tsx', (s) => s.replace(/href="\/build"/g, 'href="https://cloud.portaljs.com"')),
  ],
  // The other half of po-oh0: a hero that reads well and converts nothing.
  [
    'hero CTA removed',
    (d) =>
      edit(d, 'components/home/LandingHero.tsx', (s) =>
        s.replace(/const BUILD_ROUTE = '\/build'/, "const BUILD_ROUTE = '/docs'").replace(/href="\/build"/g, 'href="/docs"'),
      ),
  ],
  [
    'hero defaults to the mode without the CTA',
    (d) =>
      edit(d, 'components/home/LandingHero.tsx', (s) =>
        s.replace("useState<'terminal' | 'gui'>('gui')", "useState<'terminal' | 'gui'>('terminal')"),
      ),
  ],
  // The destination stops being signup-capable while still being a valid route.
  [
    '/build no longer calls Arc',
    (d) => edit(d, 'pages/build.tsx', (s) => s.replace('/email/start', '/coming-soon')),
  ],
  [
    '/build stops emitting build_signup_submitted',
    (d) => edit(d, 'pages/build.tsx', (s) => s.replace("track('build_signup_submitted'", "noTrack('build_signup_submitted'")),
  ],
  // po-6el's own bug class: capture moved behind the network call.
  [
    'build_signup_submitted moved after the Arc request',
    (d) =>
      edit(d, 'pages/build.tsx', (s) => {
        const call = /track\('build_signup_submitted', \{[\s\S]*?\n    \}\)\n/.exec(s)
        return s.replace(call[0], '').replace("      track('build_email_sent')", `      ${call[0].trim()}\n      track('build_email_sent')`)
      }),
  ],
  [
    'PostHog init moved back into an effect',
    (d) =>
      edit(d, 'pages/_app.tsx', (s) =>
        s.replace("if (typeof window !== 'undefined') {", 'function MyApp() {\n  useEffect(() => {'),
      ),
  ],
  // po-80u: a CTA can keep its href and still be gone for most visitors.
  [
    'nav CTA hidden below the lg breakpoint',
    (d) =>
      edit(d, 'components/Nav.tsx', (s) =>
        s.replace('className="inline-flex flex-shrink-0 items-center', 'className="hidden lg:inline-flex items-center'),
      ),
  ],
  [
    'nav CTA stops reporting itself',
    (d) => edit(d, 'components/Nav.tsx', (s) => s.replace(/onClick=\{\(\) => track\('nav_cta_clicked'[^}]*\}\)\}\n\s*/, '')),
  ],
  // po-80u's headline defect: the closing CTA aimed at the docs.
  [
    'closing CTA repointed at the docs',
    (d) =>
      edit(d, 'components/home/CtaBand.tsx', (s) =>
        s.replace("const BUILD_ROUTE = '/build'", "const BUILD_ROUTE = 'https://portaljs.com/docs'"),
      ),
  ],
  [
    'closing CTA demoted below a docs button',
    (d) =>
      edit(d, 'components/home/CtaBand.tsx', (s) =>
        s.replace('<Link\n                href={BUILD_ROUTE}', '<a href={DOCS_URL} />\n              <Link\n                href={BUILD_ROUTE}'),
      ),
  ],
  [
    'closing CTA stops reporting itself',
    (d) =>
      edit(d, 'components/home/CtaBand.tsx', (s) => s.replaceAll("track('home_cta_band_clicked'", "noTrack('home_cta_band_clicked'")),
  ],
  // Deleting an entry point entirely must fail, not vacuously pass.
  ['the hero file is deleted', (d) => fs.rmSync(path.join(d, 'components/home/LandingHero.tsx'))],
  ['the closing CTA file is deleted', (d) => fs.rmSync(path.join(d, 'components/home/CtaBand.tsx'))],
]

let failed = 0

const real = runGuard(SITE)
if (real.status !== 0) {
  console.error(`✖ guard fails on the real site/ — it should pass here.\n${real.stdout}${real.stderr}`)
  failed++
} else {
  console.log('✓ passes on the real site/')
}

for (const [name, mutate] of cases) {
  const dir = fixture(name.replace(/\W+/g, '-'), mutate)
  const res = runGuard(dir)
  if (res.status === 0) {
    console.error(`✖ guard PASSED a tree where ${name} — it must fail.`)
    failed++
  } else {
    console.log(`✓ catches: ${name}`)
  }
  fs.rmSync(dir, { recursive: true, force: true })
}

if (failed) {
  console.error(`\n✖ signup guard self-test FAILED — ${failed} case(s).`)
  process.exit(1)
}
console.log(`\n✓ signup guard self-test passed — ${cases.length + 1} cases.`)
