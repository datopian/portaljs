// DCAT interop — the serialization + harvest layer.
//
// The metadata-profile contract (./types.ts) is Frictionless-native: a dataset is
// authored as a Frictionless Data Package (Table Schema + descriptor fields). DCAT
// / DCAT-AP is the *serialization + harvest* layer ON TOP of that model — the
// interop format a portal exposes (a `/catalog.jsonld`) so external catalogs and
// government data portals (e.g. data.europa.eu) can harvest it, and ingests from
// when importing.
//
// This maps the Frictionless-native shape to/from DCAT-3 JSON-LD. The mapping is
// deliberately pragmatic, not a complete DCAT-AP profile: it covers the
// package-level descriptor fields + distributions that round-trip cleanly. DCAT
// does not carry a full Table Schema inline — the field-level schema is linked via
// a distribution's `dcat:describedBy` (a Frictionless resource descriptor) rather
// than embedded, so `fromDCAT` recovers package metadata + distribution, not the
// field schema. That asymmetry is intrinsic to DCAT, not a shortcut here.
//
// Spec: https://www.w3.org/TR/vocab-dcat-3/ · DCAT-AP for EU data portals.

import type { License, PackageMetadata, TableSchema } from './types'

// --- JSON-LD shapes (DCAT-3) ---------------------------------------------------

export type DcatDistribution = {
  '@type': 'dcat:Distribution'
  'dct:title'?: string
  // Where to get the bytes (the raw file) and where to land (the showcase page).
  'dcat:downloadURL'?: string
  'dcat:accessURL'?: string
  // Human label (e.g. "CSV") and IANA media type (e.g. "text/csv").
  'dct:format'?: string
  'dcat:mediaType'?: string
  // Link to a schema description (Frictionless resource descriptor / CSVW), when
  // the field schema is published as its own document.
  'dcat:describedBy'?: string
}

export type DcatDataset = {
  '@id'?: string
  '@type': 'dcat:Dataset'
  'dct:identifier'?: string
  'dct:title'?: string
  'dct:description'?: string
  'dcat:keyword'?: string[]
  // A license URI (Frictionless license.path) or its SPDX id (license.name).
  'dct:license'?: string
  // URLs the data was sourced from (Frictionless sources[].path).
  'dct:source'?: string[]
  'dct:issued'?: string
  'dct:modified'?: string
  'dcat:version'?: string
  'dcat:landingPage'?: string
  'dcat:distribution'?: DcatDistribution[]
}

export type DcatCatalog = {
  '@context': Record<string, string>
  '@type': 'dcat:Catalog'
  'dct:title'?: string
  'dct:description'?: string
  'dct:modified'?: string
  'dcat:dataset': DcatDataset[]
}

// The Frictionless-native shape this maps to/from. Mirrors what a Dataset carries
// (kept structural to avoid a dependency on lib/providers — the dependency runs the
// other way).
export type FrictionlessLike = PackageMetadata & {
  name?: string
  file?: string
  format?: string
  schema?: TableSchema
}

// A catalog entry adds the routing identity (namespace/slug) the catalog uses to
// build per-dataset landing pages + download URLs. A providers' Dataset is
// structurally assignable to this.
export type CatalogEntry = FrictionlessLike & {
  namespace?: string
  slug?: string
  description?: string
}

// The JSON-LD context: the prefixes used above. Kept compact and stable so a
// harvester resolves the terms.
export const DCAT_CONTEXT: Record<string, string> = {
  dcat: 'http://www.w3.org/ns/dcat#',
  dct: 'http://purl.org/dc/terms/',
}

// --- format helpers ------------------------------------------------------------

const MEDIA_TYPES: Record<string, string> = {
  csv: 'text/csv',
  tsv: 'text/tab-separated-values',
  json: 'application/json',
  geojson: 'application/geo+json',
  parquet: 'application/vnd.apache.parquet',
}

const FORMAT_LABELS: Record<string, string> = {
  csv: 'CSV',
  tsv: 'TSV',
  json: 'JSON',
  geojson: 'GeoJSON',
  parquet: 'Parquet',
}

function mediaType(format?: string): string | undefined {
  return format ? MEDIA_TYPES[format.toLowerCase()] : undefined
}

function formatLabel(format?: string): string | undefined {
  if (!format) return undefined
  return FORMAT_LABELS[format.toLowerCase()] ?? format.toUpperCase()
}

// Invert a media type back to the short format token (for fromDCAT).
function formatFromMedia(media?: string): string | undefined {
  if (!media) return undefined
  const hit = Object.entries(MEDIA_TYPES).find(([, m]) => m === media)
  return hit?.[0]
}

// Join a base URL and a path without doubling or dropping the slash. An empty base
// yields a root-relative path (fine for same-origin harvest).
function joinUrl(base: string | undefined, path: string): string {
  const p = path.replace(/^\/+/, '')
  if (!base) return `/${p}`
  return `${base.replace(/\/+$/, '')}/${p}`
}

// First license as a single URI/id (DCAT dct:license is one value).
function licenseUri(licenses?: License[]): string | undefined {
  const l = licenses?.[0]
  return l?.path ?? l?.name
}

// Drop undefined/empty entries so the JSON-LD stays clean.
function compact<T extends Record<string, unknown>>(obj: T): T {
  for (const k of Object.keys(obj)) {
    if (obj[k] === undefined) delete obj[k]
    else if (Array.isArray(obj[k]) && (obj[k] as unknown[]).length === 0) delete obj[k]
  }
  return obj
}

// --- mapping -------------------------------------------------------------------

export type ToDcatOptions = {
  // Absolute site origin (e.g. https://portal.example.org). Empty → root-relative.
  baseUrl?: string
  // The dataset's showcase/landing page (defaults to the download URL).
  landingPage?: string
  // Stable identifier (e.g. "<namespace>/<slug>").
  identifier?: string
  // Explicit download URL for the data file (defaults to `${baseUrl}/data/<file>`).
  downloadUrl?: string
}

// Serialize a dataset's Frictionless-native metadata to a DCAT Dataset node.
export function toDCAT(input: FrictionlessLike, opts: ToDcatOptions = {}): DcatDataset {
  const downloadURL =
    opts.downloadUrl ?? (input.file ? joinUrl(opts.baseUrl, `data/${input.file}`) : undefined)
  const landingPage = opts.landingPage

  const distribution: DcatDistribution | undefined = input.file
    ? compact({
        '@type': 'dcat:Distribution',
        'dct:title': input.title ?? input.name,
        'dcat:downloadURL': downloadURL,
        'dcat:accessURL': landingPage ?? downloadURL,
        'dct:format': formatLabel(input.format),
        'dcat:mediaType': mediaType(input.format),
      } as DcatDistribution)
    : undefined

  return compact({
    '@id': landingPage ?? (opts.identifier ? joinUrl(opts.baseUrl, opts.identifier) : undefined),
    '@type': 'dcat:Dataset',
    'dct:identifier': opts.identifier,
    'dct:title': input.title ?? input.name,
    'dct:description': input.description,
    'dcat:keyword': input.keywords,
    'dct:license': licenseUri(input.licenses),
    'dct:source': input.sources
      ?.map((s) => s.path ?? s.title)
      .filter((v): v is string => Boolean(v)),
    'dct:issued': input.created,
    'dct:modified': input.modified,
    'dcat:version': input.version,
    'dcat:landingPage': landingPage,
    'dcat:distribution': distribution ? [distribution] : undefined,
  } as DcatDataset)
}

// Parse a DCAT Dataset node into the Frictionless-native shape (harvest / import).
// Recovers package metadata + the first distribution's file/format. The field-level
// Table Schema is NOT recovered (DCAT links it via describedBy rather than carrying
// it inline) — re-author or fetch the linked schema separately if needed.
export function fromDCAT(node: DcatDataset): FrictionlessLike {
  const dist = node['dcat:distribution']?.[0]
  const downloadURL = dist?.['dcat:downloadURL']
  const file = downloadURL ? downloadURL.split('/').pop() || undefined : undefined
  const format =
    formatFromMedia(dist?.['dcat:mediaType']) ??
    (dist?.['dct:format'] ? dist['dct:format'].toLowerCase() : undefined)

  const license = node['dct:license']
  return compact({
    name: node['dct:title'] ?? node['dct:identifier'],
    title: node['dct:title'],
    description: node['dct:description'],
    keywords: node['dcat:keyword'],
    licenses: license
      ? [/^https?:\/\//.test(license) ? { path: license } : { name: license }]
      : undefined,
    sources: node['dct:source']?.map((p) => ({ title: p, path: p })),
    created: node['dct:issued'],
    modified: node['dct:modified'],
    version: node['dcat:version'],
    file,
    format,
  } as FrictionlessLike)
}

export type ToDcatCatalogOptions = {
  baseUrl?: string
  title?: string
  description?: string
  modified?: string
}

// Serialize the whole catalog to a DCAT Catalog node — the harvestable document a
// portal exposes at `/catalog.jsonld`. Each entry's landing page + download URL are
// derived from its namespace/slug/file so harvesters get resolvable links.
export function toDCATCatalog(
  entries: CatalogEntry[],
  opts: ToDcatCatalogOptions = {}
): DcatCatalog {
  return compact({
    '@context': DCAT_CONTEXT,
    '@type': 'dcat:Catalog',
    'dct:title': opts.title,
    'dct:description': opts.description,
    'dct:modified': opts.modified,
    'dcat:dataset': entries.map((e) => {
      const identifier =
        e.namespace && e.slug ? `${e.namespace}/${e.slug}` : e.slug ?? e.name
      const landingPage =
        e.namespace && e.slug ? joinUrl(opts.baseUrl, `@${e.namespace}/${e.slug}`) : undefined
      return toDCAT(e, { baseUrl: opts.baseUrl, identifier, landingPage })
    }),
  } as DcatCatalog)
}

// Parse a DCAT Catalog node back into Frictionless-native entries (bulk harvest).
export function fromDCATCatalog(catalog: DcatCatalog): FrictionlessLike[] {
  return (catalog['dcat:dataset'] ?? []).map(fromDCAT)
}
