#!/usr/bin/env node
//
// check-install.mjs — does the installed node_modules tree actually match the
// lockfile? (po-agh)
//
// WHY THIS EXISTS
// scripts/verify.sh used to decide whether it could skip `npm ci` by comparing
// mtimes:
//
//   [ ! "$dir/package-lock.json" -nt "$dir/node_modules" ]   # "node_modules current"
//
// That answers only one question — "was the lockfile edited after the install?" —
// and calls it "dependencies are satisfied". On 2026-08-09 the refinery's working
// tree had a PRUNED node_modules: package-lock.json pinned
// packages/ckan/node_modules/typescript@5.1.3, the directory was simply not there,
// and packages/ckan fell back to the root typescript@4.9.5. Both timestamps were
// identical (2026-07-18 11:39), so the lockfile was not newer, the install was
// skipped, and the gate failed every run with TS5023 / TS6046 / TS5070 — old-tsc
// errors that look exactly like a code defect. It did not self-heal, because the
// thing that would have repaired it was the install the heuristic kept skipping.
//
// An mtime comparison cannot see an incomplete tree. This can: it walks the
// lockfile's `packages` map and asserts every entry is actually on disk at the
// version the lockfile pins.
//
// The result is only ever used to SKIP work, so it fails toward doing the work:
// anything this script cannot verify is reported as drift, and the caller
// reinstalls. A false "drift" costs one npm ci; a false "current" costs an outage.
//
// Zero dependencies, so the gate can run it on a cold tree. Usage:
//
//   node scripts/check-install.mjs <dir>      # dir holds package-lock.json + node_modules
//
// Exit codes:
//   0  tree matches the lockfile — an install can be skipped
//   1  drift — packages missing or at the wrong version; reinstall
//   2  cannot verify (no lockfile, unreadable, unsupported format); reinstall

import fs from 'node:fs'
import path from 'node:path'

const QUIET = process.argv.includes('--quiet')
const dir = path.resolve(process.argv[2] ?? '.')

const MAX_REPORTED = 10

function cannotVerify(reason) {
  if (!QUIET) process.stderr.write(`check-install: cannot verify ${dir} — ${reason}\n`)
  process.exit(2)
}

function drift(issues) {
  if (!QUIET) {
    process.stdout.write(`check-install: ${dir} does not match its lockfile (${issues.length} problem(s)):\n`)
    for (const issue of issues.slice(0, MAX_REPORTED)) process.stdout.write(`    - ${issue}\n`)
    if (issues.length > MAX_REPORTED)
      process.stdout.write(`    ... and ${issues.length - MAX_REPORTED} more\n`)
  }
  process.exit(1)
}

const lockPath = path.join(dir, 'package-lock.json')
if (!fs.existsSync(lockPath)) cannotVerify('no package-lock.json')

let lock
try {
  lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'))
} catch (err) {
  cannotVerify(`package-lock.json is unreadable (${err.message})`)
}

// v1 lockfiles have no `packages` map, so there is nothing to check paths against.
if (!lock || typeof lock.packages !== 'object' || lock.packages === null)
  cannotVerify(`lockfileVersion ${lock?.lockfileVersion ?? '?'} has no packages map`)

if (!fs.existsSync(path.join(dir, 'node_modules')))
  drift(['node_modules/ does not exist'])

// Reading a package.json per entry is the whole cost of this check: ~1k small
// reads, well under a second, against the ~60s install it decides to skip.
function installedVersion(pkgDir) {
  try {
    return JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8')).version
  } catch {
    return null
  }
}

const issues = []

for (const [key, entry] of Object.entries(lock.packages)) {
  // "" is the root project and bare paths (e.g. "packages/ckan") are workspaces:
  // both are git-tracked source, not something npm ci puts on disk.
  if (key === '' || !key.includes('node_modules/')) continue

  const target = path.join(dir, key)
  const exists = fs.existsSync(target)

  // Optional deps are legitimately absent — most of them are the platform-specific
  // binaries (esbuild, rollup, ...) that do not match this machine.
  if (!exists) {
    if (entry.optional === true) continue
    issues.push(`missing: ${key}${entry.version ? `@${entry.version}` : ''}`)
    continue
  }

  // Workspace links point at source dirs; existence is all there is to check.
  if (entry.link === true) continue

  if (typeof entry.version === 'string') {
    const found = installedVersion(target)
    if (found === null) issues.push(`unreadable package.json: ${key}`)
    else if (found !== entry.version)
      issues.push(`version mismatch: ${key} — lockfile ${entry.version}, installed ${found}`)
  }
}

if (issues.length > 0) drift(issues)

if (!QUIET) process.stdout.write(`check-install: ${dir} matches its lockfile\n`)
