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
  // Prefix map plus per-term definitions (e.g. { '@type': '@id' }); see DCAT_CONTEXT.
  '@context': Record<string, unknown>
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

// The JSON-LD context: the prefixes used above PLUS per-term typing. In JSON-LD a
// bare string is a literal — so an IRI-valued term (a link like dcat:downloadURL)
// MUST be declared `"@type": "@id"` or a strict processor (e.g. the data.europa.eu /
// ITB DCAT-AP SHACL validator) reads it as a string literal and the feed fails the
// node-kind constraint. Likewise date terms need an xsd type or they parse as
// xsd:string. Declaring them here makes the JSON-LD serialization carry the same RDF
// as the Turtle/RDF-XML (which type these structurally in dcat-rdf.ts). Kept stable
// so harvesters resolve the terms. See po-hqe (external-validator conformance).
//
// Note: date values are typed xsd:dateTime — supply full timestamps (a date-only
// value would serialize as an ill-formed dateTime). foaf/vcard IRI terms are typed
// by the profiles (dcat-profiles.ts) where those prefixes are introduced.
export const DCAT_CONTEXT: Record<string, unknown> = {
  dcat: 'http://www.w3.org/ns/dcat#',
  dct: 'http://purl.org/dc/terms/',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  // IRI-valued terms (links) — string value ⇒ IRI, not a literal.
  'dcat:downloadURL': { '@type': '@id' },
  'dcat:accessURL': { '@type': '@id' },
  'dcat:landingPage': { '@type': '@id' },
  'dcat:theme': { '@type': '@id' },
  'dcat:themeTaxonomy': { '@type': '@id' },
  'dcat:mediaType': { '@type': '@id' },
  'dct:license': { '@type': '@id' },
  'dct:conformsTo': { '@type': '@id' },
  'dct:source': { '@type': '@id' },
  'dct:language': { '@type': '@id' },
  'dct:accrualPeriodicity': { '@type': '@id' },
  'dct:format': { '@type': '@id' },
  // Date-valued terms.
  'dct:issued': { '@type': 'xsd:dateTime' },
  'dct:modified': { '@type': 'xsd:dateTime' },
  'dct:created': { '@type': 'xsd:dateTime' },
}

// --- format helpers ------------------------------------------------------------

const MEDIA_TYPES: Record<string, string> = {
  csv: 'text/csv',
  tsv: 'text/tab-separated-values',
  json: 'application/json',
  geojson: 'application/geo+json',
  parquet: 'application/vnd.apache.parquet',
}

// EU file-type authority tokens (the DCAT-AP recommended vocabulary for dct:format).
const FILE_TYPE_TOKENS: Record<string, string> = {
  csv: 'CSV',
  tsv: 'TSV',
  json: 'JSON',
  geojson: 'GEOJSON',
  parquet: 'PARQUET',
}

const IANA_MEDIA_BASE = 'http://www.iana.org/assignments/media-types/'
const EU_FILE_TYPE_BASE = 'http://publications.europa.eu/resource/authority/file-type/'

// dcat:mediaType must be an IRI (range dct:MediaType) — an IANA media-type URI, not
// the bare "text/csv" literal, or DCAT-AP's node-kind constraint rejects the feed.
function mediaTypeIri(format?: string): string | undefined {
  const mt = format ? MEDIA_TYPES[format.toLowerCase()] : undefined
  return mt ? `${IANA_MEDIA_BASE}${mt}` : undefined
}

// dct:format must be an IRI (range dct:MediaTypeOrExtent) — the EU file-type
// authority URI. Same reason: a literal "CSV" fails the DCAT-AP node-kind check.
function formatIri(format?: string): string | undefined {
  if (!format) return undefined
  const tok = FILE_TYPE_TOKENS[format.toLowerCase()] ?? format.toUpperCase()
  return `${EU_FILE_TYPE_BASE}${tok}`
}

// Invert a dcat:mediaType IRI back to the short format token (for fromDCAT). Accepts
// an IANA media-type URI or a bare media-type string (feeds in the wild use either).
function formatFromMedia(media?: string): string | undefined {
  if (!media) return undefined
  const bare = media.replace(/^https?:\/\/www\.iana\.org\/assignments\/media-types\//, '')
  const hit = Object.entries(MEDIA_TYPES).find(([, m]) => m === bare)
  return hit?.[0]
}

// Recover the short format token from a dct:format value — an EU file-type IRI
// (…/file-type/CSV), another IRI, or a plain label. Takes the trailing segment.
function formatFromFormat(fmt?: string): string | undefined {
  if (!fmt) return undefined
  const tail = fmt.split(/[/#]/).pop() ?? fmt
  return tail.toLowerCase() || undefined
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
        'dct:format': formatIri(input.format),
        'dcat:mediaType': mediaTypeIri(input.format),
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
  const format = formatFromMedia(dist?.['dcat:mediaType']) ?? formatFromFormat(dist?.['dct:format'])

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
