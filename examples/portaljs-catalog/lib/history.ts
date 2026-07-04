// Build-time resource history + activity, captured from git.
//
// Every dataset file in a PortalJS portal is versioned with git: /portaljs-add-dataset
// commits it (a raw file for bundled sample data, or a ~134 B Git LFS pointer whose
// bytes stream to Cloudflare R2 via Giftless — see .gitattributes / .lfsconfig). So a
// resource's HISTORY is just the git log of its file, and the portal's ACTIVITY is the
// union of those commits across every resource.
//
// This module reads that history at BUILD time (it shells out to `git`, so it only ever
// runs in getStaticProps — never in the browser) and bakes it into the static props.
// Deployed portals are static exports with no git in out/, so runtime capture is
// impossible; build-time capture is (see epic po-fpx, option a). Everything degrades
// cleanly: no git repo, an untracked file, or a remote passthrough URL → empty history,
// and the showcase simply hides the history/activity affordances.

import { execFileSync } from 'child_process'
import type { Dataset, Resource, ResourceVersion, ActivityEntry } from './providers'
import { getResources } from './datasets'

// Run git, returning stdout — or null if git isn't available / the command fails (not a
// repo, path untracked, etc.). Never throws: history is a progressive enhancement.
function git(args: string[]): string | null {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 32 * 1024 * 1024,
    })
  } catch {
    return null
  }
}

// A committed Git LFS pointer, e.g.
//   version https://git-lfs.github.com/spec/v1
//   oid sha256:9f86d0...
//   size 14238
// Returns the oid + byte size, or null when the blob is a raw (non-LFS) file.
function parseLfsPointer(blob: string): { oid: string; size: number } | null {
  if (!/^version https:\/\/git-lfs\.github\.com\/spec\/v1/.test(blob)) return null
  const oid = blob.match(/^oid sha256:([0-9a-f]{64})/m)?.[1]
  const size = blob.match(/^size (\d+)/m)?.[1]
  if (!oid || !size) return null
  return { oid, size: Number(size) }
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`
}

function formatDate(iso: string): string {
  const t = Date.parse(iso)
  if (Number.isNaN(t)) return iso
  return new Date(t).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Map every tracked Git LFS pointer to its repo-relative path, keyed by oid. A resource
// stored on R2 records only its public URL (…/lfs/<org>/<slug>/<oid>) — not the local
// pointer path — so this is how we recover the git path to `git log`. Built once per
// build and memoized.
let oidIndex: Map<string, string> | null = null
function lfsOidIndex(): Map<string, string> {
  if (oidIndex) return oidIndex
  oidIndex = new Map()
  // LFS pointers live under data/ (added by /portaljs-add-dataset) or public/data/.
  const listed = git(['ls-files', '-z', 'data', 'public/data'])
  if (!listed) return oidIndex
  for (const path of listed.split('\0').filter(Boolean)) {
    // `./` prefix makes `git show <rev>:<path>` resolve relative to the cwd (the
    // portal dir during a build), not the repo root — ls-files paths are cwd-relative.
    const blob = git(['show', `HEAD:./${path}`])
    if (!blob) continue
    const ptr = parseLfsPointer(blob)
    if (ptr) oidIndex.set(ptr.oid, path)
  }
  return oidIndex
}

// The last path segment of a URL/path (its basename), ignoring query/hash.
function basename(p: string): string {
  return p.split(/[?#]/)[0].replace(/\/+$/, '').split('/').pop() ?? ''
}

// Resolve a resource to the repo-relative path git tracks for it, or null when there's
// nothing to log (a remote passthrough URL, or an untracked file).
function resolveGitPath(r: Resource): string | null {
  const isUrl = /^(https?:)?\/\//.test(r.path)
  if (isUrl) {
    // Only R2/Giftless-hosted files carry history: the basename is the LFS oid.
    const oid = basename(r.path)
    if (/^[0-9a-f]{64}$/i.test(oid)) return lfsOidIndex().get(oid.toLowerCase()) ?? null
    return null
  }
  // Inline sample data: served from /public/data, so the git path is public/data/<file>.
  const candidate = `public/data/${basename(r.path)}`
  const tracked = git(['ls-files', '--error-unmatch', candidate])
  return tracked === null ? null : candidate
}

// Per-version download href. For an LFS resource, versions are content-addressed on R2,
// so swap the current oid in the resource URL for the historical one. For inline files
// only the working-tree version is served statically, so historical bytes aren't
// independently downloadable — omit the link (undefined).
function versionDownloadHref(r: Resource, oid: string | null): string | undefined {
  if (!oid) return undefined
  if (!/^(https?:)?\/\//.test(r.path)) return undefined
  return r.path.replace(/[^/]+([?#].*)?$/, oid)
}

// A lightweight line diff between two raw-text (non-LFS) versions of a file. We can only
// do this when the bytes live in git; LFS-pointer resources fall back to a summary only.
// Not a real unified diff — a set difference of lines, which for CSV/TSV reads as
// added/removed rows and is what the mockup shows.
function textDiff(
  prev: string,
  cur: string,
): { summary: string; lines: ResourceVersion['diffLines'] } | null {
  const prevLines = prev.split('\n')
  const curLines = cur.split('\n')
  // Drop a shared header row so it never shows as a change.
  const header = prevLines[0] === curLines[0] ? 1 : 0
  const prevSet = new Set(prevLines.slice(header))
  const curSet = new Set(curLines.slice(header))
  const added = curLines.slice(header).filter((l) => l.trim() && !prevSet.has(l))
  const removed = prevLines.slice(header).filter((l) => l.trim() && !curSet.has(l))
  if (added.length === 0 && removed.length === 0) return null

  const summary =
    [
      added.length ? `+${added.length}` : '',
      removed.length ? `−${removed.length}` : '',
    ]
      .filter(Boolean)
      .join(' ') + (added.length + removed.length === 1 ? ' row' : ' rows')

  // Interleave a capped, readable preview: removals then additions.
  const CAP = 6
  const lines: NonNullable<ResourceVersion['diffLines']> = []
  for (const text of removed.slice(0, CAP)) lines.push({ type: 'remove', text: `− ${text}` })
  for (const text of added.slice(0, CAP - lines.length)) lines.push({ type: 'add', text: `+ ${text}` })
  const hidden = added.length + removed.length - lines.length
  if (hidden > 0) lines.push({ type: 'add', text: `+ ${hidden} more row${hidden === 1 ? '' : 's'}…` })
  return { summary, lines }
}

// The git log of one resource's file, newest commit first, as versioned resource history.
// v1 is the oldest commit; vN the newest. Returns [] when the file has no git history.
function resourceHistory(r: Resource): ResourceVersion[] {
  const gitPath = resolveGitPath(r)
  if (!gitPath) return []

  // --follow tracks the file across renames. NUL-delimited so subjects can't break parsing.
  const log = git(['log', '--follow', '--format=%H%x1f%aI%x1f%s', '--', gitPath])
  if (!log) return []
  const commits = log
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [sha, iso, message] = l.split('\x1f')
      return { sha, iso, message }
    })
  if (commits.length === 0) return []

  // Read each commit's blob once (oldest→newest) so a diff can compare against the prior
  // version. `git show <sha>:<path>` yields the raw file or the LFS pointer text.
  const chrono = [...commits].reverse()
  // `./` prefix → resolve <path> relative to cwd (the portal dir), not the repo root.
  const blobs = chrono.map((c) => git(['show', `${c.sha}:./${gitPath}`]))

  const versions: ResourceVersion[] = chrono.map((c, i) => {
    const blob = blobs[i]
    const ptr = blob ? parseLfsPointer(blob) : null
    const oid = ptr?.oid ?? null
    const size = ptr ? ptr.size : blob != null ? Buffer.byteLength(blob) : undefined

    // Only assign defined keys — Next's getStaticProps rejects `undefined` in props.
    const version: ResourceVersion = {
      version: `v${i + 1}`,
      sha: c.sha.slice(0, 7),
      date: formatDate(c.iso),
      dateISO: c.iso,
      message: c.message,
    }
    if (size != null) version.size = humanSize(size)
    const href = versionDownloadHref(r, oid)
    if (href) version.downloadHref = href

    // Line diff only for raw-text tabular files whose prior version is also raw. LFS
    // pointers carry no content, and binary/columnar formats (parquet) aren't
    // line-diffable — both get a summary at most, never garbled lines.
    const textFormat = r.format === 'csv' || r.format === 'tsv' || r.format === 'json' || r.format === 'geojson'
    if (i > 0 && !ptr && textFormat) {
      const prev = blobs[i - 1]
      if (blob != null && prev != null && !parseLfsPointer(prev)) {
        const diff = textDiff(prev, blob)
        if (diff) {
          version.diffSummary = diff.summary
          version.diffLines = diff.lines
        }
      }
    }
    return version
  })

  // Newest first, matching the timeline in the mockup.
  return versions.reverse()
}

// Enrich a dataset's resources with their git history, and derive the portal activity
// feed (every resource commit, newest first). Called from getStaticProps at build time.
export function withHistory(dataset: Dataset): {
  resources: Resource[]
  activity: ActivityEntry[]
} {
  const resources = getResources(dataset).map((r) => ({
    ...r,
    history: resourceHistory(r),
  }))

  const activity: ActivityEntry[] = resources
    .flatMap((r) =>
      (r.history ?? []).map((v) => ({
        date: v.date,
        dateISO: v.dateISO,
        filename: r.title ?? r.name,
        message: v.message,
        sha: v.sha,
      })),
    )
    .sort((a, b) => Date.parse(b.dateISO) - Date.parse(a.dateISO))

  return { resources, activity }
}
