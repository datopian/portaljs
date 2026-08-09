#!/usr/bin/env node
//
// check-install-selftest.mjs — proves the install check actually detects drift (po-agh).
//
// The heuristic this replaces was wrong in one direction only: it said "current"
// about a tree that was not. So the cases that matter here are the ones where the
// check must report DRIFT, above all the po-agh shape itself — a pruned tree whose
// lockfile is OLDER than node_modules, i.e. exactly what the mtime comparison
// called satisfied.
//
// The other half is just as load-bearing: the check must return 0 on a tree that
// really does match, or the gate reinstalls on every run and nobody keeps it.
//
// Each case is a fixture tree written to a temp dir. Zero dependencies; nothing is
// installed. Usage:  node scripts/check-install-selftest.mjs

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const CHECK = path.join(HERE, 'check-install.mjs')
const ROOT = path.resolve(HERE, '..')

// EXIT CODES, as scripts/verify.sh reads them: 0 skip the install, anything else run it.
const MATCHES = 0
const DRIFT = 1
const CANNOT_VERIFY = 2

function runCheck(dir) {
  return spawnSync(process.execPath, [CHECK, dir, '--quiet'], { encoding: 'utf8' })
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(value, null, 2))
}

// A package on disk: node_modules/<name>/package.json at <version>.
function writePkg(dir, rel, version) {
  writeJson(path.join(dir, rel, 'package.json'), { name: path.basename(rel), version })
}

// The baseline fixture: a lockfile pinning four packages, all correctly installed.
// Mirrors the real shape — a root dep, a nested workspace dep (the po-agh victim),
// a workspace link, and a platform-specific optional dep.
function baseline(dir) {
  writeJson(path.join(dir, 'package-lock.json'), {
    name: 'fixture',
    lockfileVersion: 3,
    packages: {
      '': { name: 'fixture', workspaces: ['packages/ckan'] },
      'packages/ckan': { name: '@portaljs/ckan', version: '1.0.0' },
      'node_modules/@portaljs/ckan': { resolved: 'packages/ckan', link: true },
      'node_modules/typescript': { version: '4.9.5', dev: true },
      'packages/ckan/node_modules/typescript': { version: '5.1.3', dev: true },
      'node_modules/@esbuild/linux-x64': { version: '0.19.0', optional: true },
    },
  })
  writeJson(path.join(dir, 'packages/ckan/package.json'), { name: '@portaljs/ckan', version: '1.0.0' })
  writePkg(dir, 'node_modules/typescript', '4.9.5')
  writePkg(dir, 'packages/ckan/node_modules/typescript', '5.1.3')
  // The workspace link — a directory is enough for an existence check.
  fs.mkdirSync(path.join(dir, 'node_modules/@portaljs/ckan'), { recursive: true })
  // node_modules/@esbuild/linux-x64 is deliberately absent: optional, wrong platform.
}

function fixture(name, mutate) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `check-install-${name}-`))
  baseline(dir)
  mutate?.(dir)
  return dir
}

const cases = [
  ['a fully installed tree matches', MATCHES, null],

  // po-agh itself. packages/ckan/node_modules/typescript@5.1.3 was gone, so
  // packages/ckan resolved the root typescript@4.9.5 and every tsc call failed with
  // TS5023 / TS6046 / TS5070. The mtimes were identical, so the install was skipped.
  [
    'a pruned nested dep is drift even when the lockfile is older than node_modules',
    DRIFT,
    (d) => {
      fs.rmSync(path.join(d, 'packages/ckan/node_modules/typescript'), { recursive: true })
      const old = new Date('2026-07-18T11:39:00Z')
      const now = new Date('2026-08-09T12:00:00Z')
      fs.utimesSync(path.join(d, 'package-lock.json'), old, old)
      fs.utimesSync(path.join(d, 'node_modules'), now, now)
    },
  ],

  ['a missing top-level dep is drift', DRIFT, (d) => fs.rmSync(path.join(d, 'node_modules/typescript'), { recursive: true })],

  // The lockfile moved on and the tree did not — the one case mtimes did catch.
  ['a dep installed at the wrong version is drift', DRIFT, (d) => writePkg(d, 'node_modules/typescript', '4.0.0')],

  ['a package with no readable package.json is drift', DRIFT, (d) => fs.rmSync(path.join(d, 'node_modules/typescript/package.json'))],

  ['a broken workspace link is drift', DRIFT, (d) => fs.rmSync(path.join(d, 'node_modules/@portaljs/ckan'), { recursive: true })],

  ['no node_modules at all is drift', DRIFT, (d) => fs.rmSync(path.join(d, 'node_modules'), { recursive: true })],

  // Most optional entries are other platforms' prebuilt binaries; absence is normal
  // and must not make the gate reinstall on every single run.
  ['a missing optional dep is not drift', MATCHES, null],

  // Anything unverifiable has to land on "reinstall", never on "skip".
  ['no lockfile cannot be verified', CANNOT_VERIFY, (d) => fs.rmSync(path.join(d, 'package-lock.json'))],
  ['an unparsable lockfile cannot be verified', CANNOT_VERIFY, (d) => fs.writeFileSync(path.join(d, 'package-lock.json'), '{ not json')],
  [
    'a v1 lockfile cannot be verified',
    CANNOT_VERIFY,
    (d) => writeJson(path.join(d, 'package-lock.json'), { name: 'fixture', lockfileVersion: 1, dependencies: {} }),
  ],
]

let failed = 0

for (const [name, expected, mutate] of cases) {
  const dir = fixture(name.replace(/\W+/g, '-').slice(0, 40), mutate)
  const status = runCheck(dir).status
  if (status !== expected) {
    console.error(`  ✗ ${name} — expected exit ${expected}, got ${status}`)
    failed++
  } else {
    console.log(`  ✓ ${name} (exit ${status})`)
  }
  fs.rmSync(dir, { recursive: true, force: true })
}

// And it has to work on this repo, not only on fixtures: whatever the answer is,
// it must be one of the three defined codes rather than a crash.
const real = runCheck(ROOT).status
if (![MATCHES, DRIFT, CANNOT_VERIFY].includes(real)) {
  console.error(`  ✗ checking the real repo exited ${real}`)
  failed++
} else {
  console.log(`  ✓ runs against the real repo (exit ${real})`)
}

if (failed) {
  console.error(`\n✖ check-install self-test FAILED — ${failed} case(s).`)
  process.exit(1)
}
console.log(`\n✓ check-install self-test passed — ${cases.length + 1} cases.`)
