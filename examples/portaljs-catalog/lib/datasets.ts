// Portal config + presentation helpers for datasets.
//
// The DATA itself is read through the provider seam in lib/providers (so a
// backend can replace the static source without touching any page). This module
// holds only the provider-independent bits: the Dataset shape, the namespace
// mode, and the canonical URL helper.

import type { Dataset, Resource } from './providers'

export type { Dataset, Resource } from './providers'

// A portal uses exactly ONE namespace mode. Set to 'theme' for a single-publisher
// portal (datasets grouped by subject) or 'owner' for a multi-publisher portal
// (datasets grouped by who published them). This only changes the showcase
// metadata label ("Theme" vs "Owner") — the URL is always /@<namespace>/<slug>.
export const NAMESPACE_TYPE: 'theme' | 'owner' = 'theme'

// The compute engine for a dataset's data on its showcase page:
//   'duckdb' — load the file into in-browser DuckDB-Wasm and expose a SQL query
//              view (filter/aggregate/join over CSV/Parquet, no server). The
//              default: every portal ships the AI-native SQL editor out of the box.
//   'flat'   — fetch the file and preview it (papaparse). Lightest; downgrade to
//              this for trivial reference-only portals that never need querying.
// This is the "compute" slot on the storage+compute spectrum (see ROADMAP.md).
// The duckdb-wasm chunk loads on-demand in the browser only when a query view
// renders, so first-load cost is deferred. `/portaljs-architect` may downgrade to
// 'flat' for preview-only portals but otherwise leaves this default in place.
export const DATA_QUERY: 'flat' | 'duckdb' = 'duckdb'

// Canonical URL for a dataset's showcase page. Datasets are namespaced under `@`
// so they never collide with regular content/static pages (which never start
// with `@`). See README for the routing rationale.
export function datasetHref(d: Dataset): string {
  return `/@${d.namespace}/${d.slug}`
}

// Normalize a dataset to its resource list. A multi-resource dataset returns its
// `resources` as-is; a single-file dataset is presented as one synthesized
// resource (from `file`/`format`/`schema`) so every surface renders datasets
// uniformly — there's no single-vs-multi branching at the call site.
export function getResources(d: Dataset): Resource[] {
  if (d.resources && d.resources.length > 0) return d.resources
  if (d.file) {
    return [
      {
        name: 'data',
        path: d.file,
        format: d.format ?? 'csv',
        title: d.name,
        schema: d.schema,
      },
    ]
  }
  return []
}

// Public URL of a resource's raw file. A relative `path` is served statically from
// /public/data; an absolute path is returned as-is, so a resource can point at a remote
// file (e.g. a CKAN/DCAT download URL harvested by /portaljs-migrate) or a site-root path without
// copying bytes into the repo.
export function resourceUrl(r: Resource): string {
  if (/^(https?:)?\/\//.test(r.path) || r.path.startsWith('/')) return r.path
  return `/data/${r.path}`
}

// Human-readable label for a resource in the file list. `path` can be an R2/LFS
// URL whose basename is a 64-hex content id (data.portaljs.com/lfs/<org>/<slug>/<oid>)
// — meaningless and very long, so never render it raw. Prefer the resource title,
// then a real-looking filename basename, then the resource name, and only fall
// back to a generic "Download <format>" label.
export function resourceLabel(r: Resource): string {
  if (r.title) return r.title
  const base = (r.path.split(/[?#]/)[0].split('/').pop() ?? '').trim()
  const isOid = /^[0-9a-f]{64}$/i.test(base)
  if (base && !isOid && /\.[a-z0-9]{1,6}$/i.test(base)) return base
  return r.name || `Download ${r.format}`
}

// Words too generic to make useful suggested searches. Only applied when mining
// dataset titles (keywords are already curated, so they're never filtered).
const SUGGESTION_STOPWORDS = new Set([
  'the', 'and', 'for', 'per', 'from', 'with', 'data', 'dataset', 'datasets',
  'sample', 'capita', 'bundle', 'total', 'annual', 'monthly', 'daily',
  'estimated', 'world', 'national',
])

// Keep an all-caps/numeric acronym as-is (GDP); lowercase everything else so
// suggestions read as search terms, not headline-cased words.
function normalizeSuggestion(token: string): string {
  return /^[A-Z0-9]{2,}$/.test(token) ? token : token.toLowerCase()
}

// Derive the home page's "popular searches" from the portal's own datasets rather
// than hardcoding topics. Keywords/tags are the strongest signal (an explicit,
// shared theme, so frequency-ranked); when they don't fill the list, supplement
// with one head term per title — the last salient word, usually the topic noun in
// "Publisher Topic" / "Adjective Noun" — so a repeated publisher prefix doesn't
// dominate. Deduped case-insensitively and capped.
export function suggestedQueries(datasets: Dataset[], limit = 4): string[] {
  const cands = new Map<string, { display: string; score: number; order: number }>()
  let order = 0
  const add = (raw: string, weight: number) => {
    const display = raw.trim()
    if (!display) return
    const key = display.toLowerCase()
    const existing = cands.get(key)
    if (existing) existing.score += weight
    else cands.set(key, { display, score: weight, order: order++ })
  }

  for (const d of datasets) for (const kw of d.keywords ?? []) add(kw, 10)

  if (cands.size < limit) {
    for (const d of datasets) {
      const words = (d.name ?? '')
        .split(/[^A-Za-z0-9]+/)
        .map(normalizeSuggestion)
        .filter((w) => w.length >= 3 && !SUGGESTION_STOPWORDS.has(w.toLowerCase()))
      const head = words[words.length - 1]
      if (head) add(head, 1)
    }
  }

  return Array.from(cands.values())
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, limit)
    .map((c) => c.display)
}
