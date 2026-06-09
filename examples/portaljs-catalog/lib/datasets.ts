// Portal config + presentation helpers for datasets.
//
// The DATA itself is read through the provider seam in lib/providers (so a
// backend can replace the static source without touching any page). This module
// holds only the provider-independent bits: the Dataset shape, the namespace
// mode, and the canonical URL helper.

import type { Dataset } from './providers'

export type { Dataset } from './providers'

// A portal uses exactly ONE namespace mode. Set to 'theme' for a single-publisher
// portal (datasets grouped by subject) or 'owner' for a multi-publisher portal
// (datasets grouped by who published them). This only changes the showcase
// metadata label ("Theme" vs "Owner") — the URL is always /@<namespace>/<slug>.
export const NAMESPACE_TYPE: 'theme' | 'owner' = 'theme'

// The compute engine for a dataset's data on its showcase page:
//   'flat'   — fetch the file and preview it (papaparse). Lightest; the default.
//   'duckdb' — load the file into in-browser DuckDB-Wasm and expose a SQL query
//              view (filter/aggregate/join over CSV/Parquet, no server).
// This is the "compute" slot on the storage+compute spectrum (see ROADMAP.md);
// `/architect` flips it to 'duckdb' when the portal needs querying, not just
// preview. DuckDB only loads in the browser and only when a showcase renders.
export const DATA_QUERY: 'flat' | 'duckdb' = 'flat'

// Canonical URL for a dataset's showcase page. Datasets are namespaced under `@`
// so they never collide with regular content/static pages (which never start
// with `@`). See README for the routing rationale.
export function datasetHref(d: Dataset): string {
  return `/@${d.namespace}/${d.slug}`
}
