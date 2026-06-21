#!/usr/bin/env node
// Export-hygiene guard for /portaljs-deploy (epic po-g9y, phase 7).
//
// A deployed PortalJS portal serves its large data FROM Cloudflare R2 — the
// static export must carry ZERO dataset bytes. Big data is referenced by an
// absolute R2 URL in datasets.json, which resourceUrl() passes through unchanged
// (lib/datasets.ts), so the browser fetches it straight from R2 and nothing is
// copied into out/. This script asserts that contract on the built export and
// fails the deploy if it's broken.
//
// Two failure modes it catches:
//   1. LFS pointer leak — an LFS-tracked file was exported as its ~130-byte
//      pointer text (the bytes were never pulled). The deployed portal would
//      serve the stub instead of data. Fix: reference it by absolute R2 URL in
//      datasets.json (use /portaljs-add-dataset), not a relative public/data path.
//   2. Bloat — a data file at/over the size budget landed in the export (e.g. an
//      LFS file that WAS pulled into the working tree, or a big file dropped in
//      public/data). Large bytes belong in R2, not the export.
//
// Framework assets under _next/ are exempt from the size budget — Next.js /
// duckdb-wasm chunks are legitimately large and are not dataset bytes.
//
// Usage:   node scripts/check-export.mjs [exportDir]      (default: out)
//          MAX_FILE_MB=10 node scripts/check-export.mjs
// Exit 0 = clean, 1 = violations found (or export dir missing).

import { readdirSync, statSync, openSync, readSync, closeSync, existsSync, readFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const EXPORT_DIR = process.argv[2] || 'out'
const MAX_FILE_MB = Number(process.env.MAX_FILE_MB || 10)
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024
const LFS_MAGIC = 'version https://git-lfs.github.com/spec/v1'

const fmtBytes = (n) => {
  if (n < 1024) return `${n} B`
  const u = ['KB', 'MB', 'GB', 'TB']
  let v = n / 1024
  let i = 0
  while (v >= 1024 && i < u.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(1)} ${u[i]}`
}

// Read the first bytes of a file and report whether it's a Git LFS pointer.
function isLfsPointer(path) {
  let fd
  try {
    fd = openSync(path, 'r')
    const buf = Buffer.alloc(LFS_MAGIC.length)
    const n = readSync(fd, buf, 0, LFS_MAGIC.length, 0)
    return n === LFS_MAGIC.length && buf.toString('utf8') === LFS_MAGIC
  } catch {
    return false
  } finally {
    if (fd !== undefined) closeSync(fd)
  }
}

function walk(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full, files)
    else if (entry.isFile()) files.push(full)
  }
  return files
}

if (!existsSync(EXPORT_DIR)) {
  console.error(`✖ [check-export] export dir not found: ${EXPORT_DIR}/ — run \`npm run build\` first.`)
  process.exit(1)
}

const files = walk(EXPORT_DIR)
const pointerLeaks = []
const bloat = []
let totalBytes = 0

for (const path of files) {
  const rel = relative(EXPORT_DIR, path)
  const size = statSync(path).size
  totalBytes += size

  // An LFS pointer is tiny, so the size budget never catches it — check the magic.
  if (isLfsPointer(path)) {
    pointerLeaks.push(rel)
    continue
  }

  // Framework chunks (_next/) are exempt — they're app assets, not dataset bytes.
  const inNext = rel === '_next' || rel.startsWith(`_next${sep}`)
  if (!inNext && size >= MAX_FILE_BYTES) bloat.push({ rel, size })
}

// Best-effort manifest summary: which datasets serve from R2 vs inline.
function manifestSummary() {
  if (!existsSync('datasets.json')) return null
  let datasets
  try {
    datasets = JSON.parse(readFileSync('datasets.json', 'utf8'))
  } catch {
    return null
  }
  let r2 = 0
  let inline = 0
  const paths = []
  for (const d of datasets) {
    const resources = d.resources?.length ? d.resources : d.file ? [{ path: d.file }] : []
    for (const r of resources) paths.push(r.path || '')
  }
  for (const p of paths) {
    if (/^(https?:)?\/\//.test(p)) r2++
    else inline++
  }
  return { r2, inline, total: paths.length }
}

const ms = manifestSummary()

console.log(`[check-export] ${EXPORT_DIR}/  —  ${files.length} files, ${fmtBytes(totalBytes)} total`)
if (ms) {
  console.log(`[check-export] datasets.json: ${ms.r2}/${ms.total} resources served from R2 (absolute URL), ${ms.inline} inline`)
}

if (pointerLeaks.length === 0 && bloat.length === 0) {
  console.log(`✓ [check-export] clean — no LFS pointer leaks, no files ≥ ${MAX_FILE_MB} MB. Data is served from R2.`)
  process.exit(0)
}

if (pointerLeaks.length) {
  console.error(`\n✖ [check-export] LFS pointer leak — ${pointerLeaks.length} unresolved Git LFS pointer(s) in the export:`)
  for (const p of pointerLeaks) console.error(`    ${p}`)
  console.error(
    `  These ship a ~130-byte stub instead of the data. Serve the file from R2:\n` +
      `  reference it by its absolute R2 URL in datasets.json (run /portaljs-add-dataset),\n` +
      `  not a relative public/data path. Do NOT \`git lfs pull\` into the export.`,
  )
}

if (bloat.length) {
  console.error(`\n✖ [check-export] export bloat — ${bloat.length} file(s) ≥ ${MAX_FILE_MB} MB (data belongs in R2, not the export):`)
  for (const { rel, size } of bloat) console.error(`    ${rel}  (${fmtBytes(size)})`)
  console.error(
    `  Large data must be served from R2 via an absolute URL in datasets.json, not\n` +
      `  inlined under public/. If this is a legitimately large app asset, raise the\n` +
      `  budget: MAX_FILE_MB=<n> npm run check-export.`,
  )
}

process.exit(1)
