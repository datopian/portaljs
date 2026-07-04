// The data-provider contract.
//
// The three surfaces (home, the /search catalog, and the /@<namespace>/<slug>
// showcase) read the portal's data ONLY through a DataProvider. This is the seam
// that keeps PortalJS decoupled: the static/git default and any backend (CKAN,
// OpenMetadata, a git-LFS + object-store source) implement the same interface, so
// swapping where data comes from never touches a page.

import type { License, Source, TableSchema } from '../metadata/types'

// 'parquet' is the columnar format for the query tier: the showcase reads it
// through DuckDB-Wasm (not the flat papaparse Table), and on R2 it's queried in
// place over HTTP range requests — see lib/query.
export type DataFormat = 'csv' | 'tsv' | 'json' | 'geojson' | 'parquet'

// One line of a version-to-version diff, shown when a resource's history is expanded.
// Only raw-text resources (CSV/TSV committed in git) produce these; an LFS-pointer
// resource carries no content, so it gets a summary without lines.
export type DiffLine = { type: 'add' | 'remove'; text: string }

// One versioned state of a resource's file, derived from a git commit that touched it
// (see lib/history.ts). Populated at build time; empty for files with no git history.
export type ResourceVersion = {
  version: string // v1 (oldest) … vN (newest)
  sha: string // short commit sha
  date: string // human date, e.g. "Jun 28, 2026"
  dateISO: string // ISO date, for sorting the activity feed
  message: string // commit subject
  size?: string // humanized byte size at this version (from the LFS pointer or blob)
  downloadHref?: string // per-version download (content-addressed on R2 for LFS files)
  diffSummary?: string // short delta, e.g. "+3 rows"
  diffLines?: DiffLine[] // capped line preview (raw-text files only)
}

// One entry in the portal activity feed: a single resource commit, surfaced across all
// of a dataset's resources and sorted newest-first.
export type ActivityEntry = {
  date: string
  dateISO: string
  filename: string
  message: string
  sha: string
}

// A single file within a dataset (a Frictionless "resource"). A dataset can hold
// several — data + a data dictionary + methodology, or quarterly files, etc.
export type Resource = {
  // Stable id within the dataset (e.g. "data", "dictionary"). Used in anchors.
  name: string
  // Bare filename served from /public/data (e.g. "orders-2024.csv").
  path: string
  format: DataFormat
  title?: string
  description?: string
  // Per-resource Frictionless Table Schema.
  schema?: TableSchema
  // Optional starter SQL for the DuckDB query view (the SQL editor). When set,
  // the editor opens with this query instead of the generic `SELECT * FROM data`
  // preview — use it to show off a meaningful aggregate on a query-first dataset.
  // The table is always named `data`.
  query?: string
  // Version history of this file, captured from git at build time (lib/history.ts).
  // Absent/empty for files with no git history; the showcase hides the affordance.
  history?: ResourceVersion[]
}

export type Dataset = {
  slug: string
  namespace: string
  name: string
  description?: string
  // Single-resource sugar — a one-file dataset sets `file`/`format` (+ optional
  // `schema`) directly. For multiple files, use `resources` below. Read either
  // shape through getResources() (lib/datasets.ts), which normalizes to a
  // Resource[]; surfaces consume that, not `file` directly.
  file?: string
  format?: DataFormat
  // Multiple files in one dataset (Frictionless Data Package resources). When
  // present, takes precedence over the single `file`/`format` above.
  resources?: Resource[]

  // --- metadata-profile contract (lib/metadata) ---
  // How this dataset's schema + descriptive metadata are authored and surfaced.
  // All optional: a dataset with none still lists and previews — the showcase
  // degrades cleanly. A backend provider maps its native metadata onto these.
  //
  // MetadataProfile id (defaults to the L0 'frictionless-tabular'); surfaces
  // resolve it via getProfile().
  profile?: string
  // Frictionless Table Schema — for a single-resource dataset, the schema of
  // that file. (Per-file schemas for multi-resource live on each Resource.)
  schema?: TableSchema
  // Data Package descriptor fields a catalog surfaces.
  licenses?: License[]
  sources?: Source[]
  keywords?: string[]
  created?: string
  modified?: string
  version?: string
}

// A discovery query against the catalog. The static provider filters in memory;
// a backend provider translates these to its own search API (e.g. CKAN
// package_search, faceted by namespace/format).
export type DatasetQuery = {
  q?: string
  namespace?: string
  format?: Dataset['format']
}

// What a provider can do beyond the read-only static baseline. Surfaces and skills
// branch on these instead of sniffing the provider type — they map onto the
// storage + compute spectrum in ROADMAP.md.
export type ProviderCapabilities = {
  // Server-side / full-text search. When false, the catalog page filters
  // client-side over listDatasets() (the static default).
  search: boolean
  // Structured data queries beyond a flat-file preview (e.g. DuckDB or a
  // datastore) — the data-query contract plugs in here.
  query: boolean
  // Create/update datasets at runtime (e.g. the CKAN API). Git-based portals
  // "write" by opening a PR, not through this, so the static provider is false.
  write: boolean
  // The backend owns access control; the portal surfaces it. Requires the
  // opt-in runtime mode (private data can't live in a public static bundle).
  rbac: boolean
}

export interface DataProvider {
  readonly name: string
  readonly capabilities: ProviderCapabilities

  // The full catalog. Used at build time by the catalog and showcase routes.
  listDatasets(): Promise<Dataset[]>

  // Resolve one dataset by its (namespace, slug) pair, which is unique across
  // the catalog. Returns null when nothing matches.
  getDataset(namespace: string, slug: string): Promise<Dataset | null>

  // Discovery. The static provider implements this in memory; a backend
  // delegates to its search service.
  search(query: DatasetQuery): Promise<Dataset[]>
}
