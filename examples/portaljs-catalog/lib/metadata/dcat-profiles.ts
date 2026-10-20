// DCAT application profiles — the harvest-compatibility layer.
//
// dcat.ts emits the pragmatic DCAT-3 JSON-LD core (Catalog → Datasets →
// Distributions) from the Frictionless-native model. National / EU / US open-data
// portals don't harvest raw DCAT-3 — they harvest a specific *application profile*
// (DCAT-AP for data.europa.eu, DCAT-US for data.gov, and national extensions like
// DCAT-AP-SE / DCAT-AP-CH / DCAT-AP.de). A profile is DCAT plus:
//   - extra @context namespaces (foaf, vcard, adms, skos, …),
//   - mandatory classes/properties the harvester requires (dct:publisher,
//     dcat:contactPoint, dct:conformsTo, …),
//   - a controlled-vocabulary expectation (EU data themes, POD access levels).
//
// This module is a small, DATA-DRIVEN registry so more national profiles are
// pluggable (config, not code): a profile augments the base DCAT-3 catalog with the
// fields its harvester requires, stamps the right `dct:conformsTo`, and reports
// which mandatory fields are still missing (see dcat-validate.ts) rather than
// silently claiming conformance.
//
// Layering: profiles sit ON TOP of dcat.ts and never fork its core mapping — they
// post-process the DcatCatalog it produces. The output is intentionally loose
// JSON-LD (extra profile properties beyond DcatDataset's typed keys), so it flows
// through the generic serializer in dcat-rdf.ts unchanged.
//
// Specs: DCAT-2 https://www.w3.org/TR/vocab-dcat-2/ · DCAT-3
// https://www.w3.org/TR/vocab-dcat-3/ · DCAT-AP
// https://semiceu.github.io/DCAT-AP/ · DCAT-US
// https://doi-do.github.io/dcat-us/ (aligns Project Open Data v1.1).

import { resolveResourceUrl, type CatalogEntry, type DcatCatalog } from './dcat'
import type { RdfFormat } from './dcat-rdf'
import type { ResourceDescriptor } from './types'

// A JSON-LD node with prefixed keys ('dct:title', '@type', …). Loose on purpose:
// profiles add properties beyond dcat.ts's typed DcatDataset shape.
export type JsonLdNode = Record<string, unknown>
// The context maps prefixes to namespaces AND may carry per-term definitions
// ({ '@type': '@id' } etc.), so values are not all strings — see DCAT_CONTEXT.
export type ProfiledCatalog = JsonLdNode & { '@context': Record<string, unknown> }

// A responsible party (dct:publisher / dct:creator). Rendered as a nested
// foaf:Agent node.
export type DcatAgent = {
  name: string
  homepage?: string
  mbox?: string
  // A URI that identifies the agent. DCAT-US requires dct:publisher to be an IRI (a
  // blank-node agent is rejected), and DCAT-AP recommends it — so the agent node is
  // minted with this as its @id. Falls back to `homepage` when omitted.
  uri?: string
  // foaf:Organization (default) or foaf:Person.
  type?: 'foaf:Organization' | 'foaf:Person'
  // The agent's dct:identifier. Only the dcat-ap-it profile emits it: DCAT-AP_IT makes
  // it mandatory on every dcatapit:Agent — the IPA code (Indice della Pubblica
  // Amministrazione) for a public administration, the VAT number (Partita IVA) for a
  // private organization. Other profiles ignore it, so setting it never changes them.
  identifier?: string
}

// A point of contact (dcat:contactPoint). Rendered as a vcard:Kind node.
export type DcatContact = {
  fn?: string
  email?: string
}

// Catalog-level configuration a profile needs but the Frictionless model doesn't
// carry (org identity, contact, controlled-vocab defaults). Authored once per portal
// in dcat.config.json and passed to apply(). Per-dataset overrides can live on a
// dataset's optional `dcat` passthrough (read structurally, not required).
export type DcatConfig = {
  title?: string
  description?: string
  // The publishing organization — mandatory in DCAT-AP and DCAT-US.
  publisher?: DcatAgent
  // Catalog contact — mandatory/recommended in DCAT-AP and DCAT-US.
  contactPoint?: DcatContact
  // Default dataset license URI when a dataset declares none.
  license?: string
  // EU data-theme URIs (or any theme scheme) applied to every dataset that
  // declares none of its own (DCAT-AP recommends dcat:theme).
  themes?: string[]
  // BCP-47 / EU language URIs for the catalog.
  languages?: string[]
  // Public homepage of the portal (foaf:homepage on the catalog).
  homepage?: string
  // DCAT-US access level default (public | restricted public | non-public).
  accessLevel?: 'public' | 'restricted public' | 'non-public'
  // Catalog-wide GeoDCAT-AP spatial coverage applied to every dataset that declares
  // none of its own (e.g. the extent of the whole catalog).
  spatial?: DcatSpatial
  // Default dct:accrualPeriodicity (dcat-ap-it only) for datasets that declare none:
  // an EU frequency IRI or its bare token ("ANNUAL", "IRREG", …). Unset → UNKNOWN.
  accrualPeriodicity?: string
}

// A pluggable DCAT application profile.
export type DcatProfile = {
  // Stable id used in config, file names (catalog.<id>.ttl) and the registry.
  readonly id: string
  readonly label: string
  // The DCAT base version this profile builds on.
  readonly dcatVersion: '2' | '3'
  // The profile spec URI stamped as dct:conformsTo on the catalog + datasets.
  readonly conformsTo?: string
  // @context prefixes this profile needs beyond dcat.ts's dcat/dct.
  readonly context: Record<string, string>
  // Restrict which RDF serializations the generator emits for this profile. When
  // omitted the generator emits every configured serialization. Croissant sets this
  // to ['jsonld'] — it is a schema.org JSON-LD format the MLCommons tooling consumes
  // as JSON-LD, and its context (aliases, @vocab, @json values) isn't meaningful as
  // Turtle/RDF-XML.
  readonly serializations?: RdfFormat[]
  // Augment a base DCAT-3 catalog (from toDCATCatalog) into this profile.
  apply(base: DcatCatalog, cfg: DcatConfig): ProfiledCatalog
  // Build the profile from the RAW Frictionless entries instead of the schema-less
  // DCAT base. DCAT drops the field-level Table Schema (dcat.ts), so a profile that
  // needs it — Croissant maps recordSets/fields from schema.fields — implements this
  // and the generator calls it in preference to apply(). Most profiles don't need it.
  applyFromEntries?(entries: CatalogEntry[], base: DcatCatalog, cfg: DcatConfig): ProfiledCatalog
}

// --- shared augmentation --------------------------------------------------------

// Namespaces used across the AP/US profiles. dcat.ts already declares dcat + dct.
const NS = {
  foaf: 'http://xmlns.com/foaf/0.1/',
  vcard: 'http://www.w3.org/2006/vcard/ns#',
  adms: 'http://www.w3.org/ns/adms#',
  skos: 'http://www.w3.org/2004/02/skos/core#',
  dcatde: 'http://dcat-ap.de/def/dcatde/',
  locn: 'http://www.w3.org/ns/locn#',
  // GeoSPARQL — the datatype (gsp:wktLiteral) GeoDCAT-AP expects on geometries/bbox.
  gsp: 'http://www.opengis.net/ont/geosparql#',
  // DCAT-AP application-profile terms (dcat:spatialResolutionInMeters lives in dcat,
  // but availability/etc. are dcatap: — declared so a richer profile can grow here).
  dcatap: 'http://data.europa.eu/r5r/',
  // DCAT-AP_IT — the Italian national profile (AgID / dati.gov.it).
  dcatapit: 'http://dati.gov.it/onto/dcatapit#',
}

function agentNode(a?: DcatAgent): JsonLdNode | undefined {
  if (!a?.name) return undefined
  const node: JsonLdNode = { '@type': a.type ?? 'foaf:Organization', 'foaf:name': a.name }
  // Identify the agent by URI (DCAT-US mandates an IRI publisher; DCAT-AP recommends
  // it). Prefer an explicit uri, else use the homepage as the agent's identifier.
  const id = a.uri ?? a.homepage
  if (id) node['@id'] = id
  if (a.homepage) node['foaf:homepage'] = a.homepage
  if (a.mbox) node['foaf:mbox'] = a.mbox.startsWith('mailto:') ? a.mbox : `mailto:${a.mbox}`
  return node
}

function contactNode(c?: DcatContact): JsonLdNode | undefined {
  if (!c?.fn && !c?.email) return undefined
  const node: JsonLdNode = { '@type': 'vcard:Kind' }
  if (c.fn) node['vcard:fn'] = c.fn
  if (c.email) node['vcard:hasEmail'] = c.email.startsWith('mailto:') ? c.email : `mailto:${c.email}`
  return node
}

// Read a dataset's optional per-dataset DCAT overrides. The provider Dataset type
// doesn't declare these, so the generator may attach a structural `dcat` field
// ({ publisher, contactPoint, themes, accessLevel }) carried through from the
// manifest — read it defensively.
type DatasetOverrides = {
  publisher?: DcatAgent
  contactPoint?: DcatContact
  themes?: string[]
  accessLevel?: DcatConfig['accessLevel']
  // GeoDCAT-AP spatial coverage for this dataset (read by the geodcat-ap profile).
  spatial?: DcatSpatial
  // DCAT-AP_IT (read by the dcat-ap-it profile only):
  //   rightsHolder        — dct:rightsHolder, the organization responsible for the
  //                         dataset (name + identifier; defaults to the dataset's
  //                         publisher override, else the catalog publisher).
  //   accrualPeriodicity  — dct:accrualPeriodicity, an EU frequency IRI or token.
  //   identifier          — the full dct:identifier ("<IPA code>:<local id>") when the
  //                         national catalog assigned one; else it is derived.
  rightsHolder?: DcatAgent
  accrualPeriodicity?: string
  identifier?: string
}

// GeoDCAT-AP spatial coverage. Authored per-dataset on the manifest's `dcat` override
// (or catalog-wide via DcatConfig.spatial). `bbox`/`geometry` are WKT strings (the
// GeoDCAT-AP / DCAT-AP recommendation — serialized as gsp:wktLiteral); `geometry`
// carries a full geometry, `bbox` just the bounding box.
export type DcatSpatial = {
  bbox?: string
  geometry?: string
  // A named place (dct:spatial can be a URI to a gazetteer entry, e.g. a GeoNames /
  // EU-vocab country IRI) — emitted as the Location's @id when present.
  uri?: string
  // Ground sample distance (dcat:spatialResolutionInMeters).
  spatialResolutionInMeters?: number
}
function overridesOf(node: JsonLdNode): DatasetOverrides {
  const raw = (node as { _dcat?: DatasetOverrides })._dcat
  return raw && typeof raw === 'object' ? raw : {}
}

// The common AP/US augmentation: merge the profile context, stamp conformsTo, add
// catalog + dataset publisher / contactPoint / themes / license from config (only
// where absent), and drop the internal `_dcat` carrier. Profile-specific extras are
// layered by each profile after calling this.
function baseAugment(base: DcatCatalog, cfg: DcatConfig, profile: DcatProfile): ProfiledCatalog {
  const context: Record<string, unknown> = { ...base['@context'], ...profile.context }
  // Ensure the namespaces for the terms baseAugment itself introduces are declared,
  // even on a plain DCAT profile whose context didn't list them (DCAT uses foaf for
  // publisher and vcard for contactPoint). Without this, a foaf:/vcard: term would
  // serialize with an undeclared prefix.
  const catPublisher = agentNode(cfg.publisher)
  const catContact = contactNode(cfg.contactPoint)
  const dsOverrides = ((base['dcat:dataset'] ?? []) as JsonLdNode[]).map(overridesOf)
  const needsFoaf =
    Boolean(catPublisher) || cfg.homepage !== undefined || dsOverrides.some((o) => o.publisher?.name)
  const needsVcard =
    Boolean(catContact) || dsOverrides.some((o) => o.contactPoint?.fn || o.contactPoint?.email)
  if (needsFoaf && !context.foaf) context.foaf = NS.foaf
  if (needsVcard && !context.vcard) context.vcard = NS.vcard
  // Type the foaf/vcard IRI-valued terms so the JSON-LD serialization reads them as
  // IRIs, not literals (matches the dcat/dct terms typed in DCAT_CONTEXT). Only when
  // the prefix is present — otherwise the term wouldn't resolve.
  if (needsFoaf) {
    if (!context['foaf:homepage']) context['foaf:homepage'] = { '@type': '@id' }
    if (!context['foaf:mbox']) context['foaf:mbox'] = { '@type': '@id' }
  }
  if (needsVcard && !context['vcard:hasEmail']) context['vcard:hasEmail'] = { '@type': '@id' }
  const catalog: ProfiledCatalog = { ...(base as JsonLdNode), '@context': context }

  if (profile.conformsTo) catalog['dct:conformsTo'] = profile.conformsTo
  if (cfg.homepage) catalog['foaf:homepage'] = cfg.homepage
  if (cfg.languages?.length) catalog['dct:language'] = cfg.languages
  if (catPublisher) catalog['dct:publisher'] = catPublisher
  if (catContact) catalog['dcat:contactPoint'] = catContact

  const datasets = (base['dcat:dataset'] ?? []) as JsonLdNode[]
  catalog['dcat:dataset'] = datasets.map((raw) => {
    const ov = overridesOf(raw)
    const ds: JsonLdNode = { ...raw }
    delete (ds as { _dcat?: unknown })._dcat

    if (profile.conformsTo && !ds['dct:conformsTo']) ds['dct:conformsTo'] = profile.conformsTo

    const publisher = agentNode(ov.publisher) ?? catPublisher
    if (publisher && !ds['dct:publisher']) ds['dct:publisher'] = publisher

    const contact = contactNode(ov.contactPoint) ?? catContact
    if (contact && !ds['dcat:contactPoint']) ds['dcat:contactPoint'] = contact

    const themes = ov.themes ?? cfg.themes
    if (themes?.length && !ds['dcat:theme']) ds['dcat:theme'] = themes

    if (cfg.license && !ds['dct:license']) ds['dct:license'] = cfg.license

    return ds
  })

  return catalog
}

// --- built-in profiles ----------------------------------------------------------

// Plain DCAT (no application profile). v3 is the default the portal has always
// emitted; v2 is the same core subset stamped as DCAT-2 (our emitted properties are
// valid in both — v3-only constructs like dataset series are not used).
export const dcat3Profile: DcatProfile = {
  id: 'dcat-3',
  label: 'DCAT 3 (W3C)',
  dcatVersion: '3',
  conformsTo: 'https://www.w3.org/TR/vocab-dcat-3/',
  context: {},
  apply(base, cfg) {
    return baseAugment(base, cfg, this)
  },
}

export const dcat2Profile: DcatProfile = {
  id: 'dcat-2',
  label: 'DCAT 2 (W3C)',
  dcatVersion: '2',
  conformsTo: 'https://www.w3.org/TR/vocab-dcat-2/',
  context: {},
  apply(base, cfg) {
    return baseAugment(base, cfg, this)
  },
}

// DCAT-AP — the European application profile (data.europa.eu). Adds foaf/vcard/adms
// namespaces and the publisher + contactPoint + theme fields the EU harvester
// requires. Themes are expected from the EU data-theme vocabulary
// (http://publications.europa.eu/resource/authority/data-theme/*).
export const dcatApProfile: DcatProfile = {
  id: 'dcat-ap',
  label: 'DCAT-AP (data.europa.eu)',
  dcatVersion: '3',
  conformsTo: 'http://data.europa.eu/r5r/',
  context: { foaf: NS.foaf, vcard: NS.vcard, adms: NS.adms, skos: NS.skos },
  apply(base, cfg) {
    return baseAugment(base, cfg, this)
  },
}

// DCAT-US — the US federal profile (data.gov), aligned with DCAT-US 3.0 / Project
// Open Data. POD requires dct:accessLevel on every dataset; default it from config
// (public) when unset.
export const dcatUsProfile: DcatProfile = {
  id: 'dcat-us',
  label: 'DCAT-US 3.0 (data.gov / Project Open Data)',
  dcatVersion: '3',
  conformsTo: 'https://resources.data.gov/resources/dcat-us/',
  context: { foaf: NS.foaf, vcard: NS.vcard, skos: NS.skos },
  apply(base, cfg) {
    const catalog = baseAugment(base, cfg, this)
    const level = cfg.accessLevel ?? 'public'
    catalog['dcat:dataset'] = (catalog['dcat:dataset'] as JsonLdNode[]).map((ds) => {
      if (ds['dct:accessLevel'] === undefined) ds['dct:accessLevel'] = level
      return ds
    })
    return catalog
  },
}

// --- GeoDCAT-AP (spatial extension of DCAT-AP) ----------------------------------

// A gsp:wktLiteral value object — a typed literal in JSON-LD (and, via dcat-rdf's
// value-object handling, in Turtle/RDF-XML). GeoDCAT-AP expects geometries and the
// bounding box as WKT (or GML) typed literals, not bare strings.
function wktLiteral(v: string): JsonLdNode {
  return { '@value': v, '@type': 'gsp:wktLiteral' }
}

// Build a dct:Location node from spatial coverage (dcat:bbox + locn:geometry).
function locationNode(s?: DcatSpatial): JsonLdNode | undefined {
  if (!s || (!s.bbox && !s.geometry && !s.uri)) return undefined
  const loc: JsonLdNode = { '@type': 'dct:Location' }
  if (s.uri) loc['@id'] = s.uri
  if (s.geometry) loc['locn:geometry'] = wktLiteral(s.geometry)
  if (s.bbox) loc['dcat:bbox'] = wktLiteral(s.bbox)
  return loc
}

// GeoDCAT-AP — the spatial-data extension of DCAT-AP (INSPIRE / geospatial catalogs).
// It IS DCAT-AP plus spatial coverage, so it layers on baseAugment and then stamps
// each dataset's dct:spatial (bbox/geometry as gsp:wktLiteral) +
// dcat:spatialResolutionInMeters from the manifest's `dcat.spatial` override (or the
// catalog-wide cfg.spatial default). A non-spatial dataset simply carries none — still
// GeoDCAT-AP-conformant, since spatial coverage is not mandatory.
export const geodcatApProfile: DcatProfile = {
  id: 'geodcat-ap',
  label: 'GeoDCAT-AP (spatial / INSPIRE)',
  dcatVersion: '3',
  conformsTo: 'http://data.europa.eu/930/',
  context: { foaf: NS.foaf, vcard: NS.vcard, adms: NS.adms, skos: NS.skos, locn: NS.locn, gsp: NS.gsp },
  apply(base, cfg) {
    // Capture spatial from the base nodes' `_dcat` carrier BEFORE baseAugment strips
    // it. Positionally aligned with the output datasets.
    const spatials = ((base['dcat:dataset'] ?? []) as JsonLdNode[]).map(
      (raw) => overridesOf(raw).spatial ?? cfg.spatial
    )
    const catalog = baseAugment(base, cfg, this)
    const datasets = (catalog['dcat:dataset'] ?? []) as JsonLdNode[]
    datasets.forEach((ds, i) => {
      const s = spatials[i]
      const loc = locationNode(s)
      if (loc && !ds['dct:spatial']) ds['dct:spatial'] = loc
      if (s?.spatialResolutionInMeters !== undefined && ds['dcat:spatialResolutionInMeters'] === undefined)
        ds['dcat:spatialResolutionInMeters'] = s.spatialResolutionInMeters
    })
    return catalog
  },
}

// --- DCAT-AP_IT (Italian national profile, AgID / dati.gov.it) ------------------

// DCAT-AP_IT is the Italian extension of DCAT-AP, harvested by dati.gov.it. Spec:
// https://docs.italia.it/italia/daf/linee-guida-cataloghi-dati-dcat-ap-it/it/stabile/dcat-ap_it.html
// · ontology http://dati.gov.it/onto/dcatapit. Beyond DCAT-AP it requires (table
// "Overview profilo"):
//   Catalog       dcatapit:Catalog — dct:title, dct:description, dct:publisher,
//                 dct:modified, dcat:dataset
//   Dataset       dcatapit:Dataset — dct:identifier ("<IPA code>:<local id>"),
//                 dct:title, dct:description, dct:modified, dcat:theme (EU data-theme),
//                 dct:rightsHolder, dct:accrualPeriodicity (EU frequency),
//                 dcat:distribution (for open data)
//   Distribution  dcatapit:Distribution — dct:format (EU file-type), dcat:accessURL,
//                 dct:license (a dcatapit:LicenseDocument)
//   Agent         dcatapit:Agent — dct:identifier (IPA code / VAT number), foaf:name
//   Contact point dcatapit:Organization (recommended) — vcard:fn, vcard:hasEmail
// The AgID validator rules also type the objects it can see: dcat:landingPage and the
// catalog foaf:homepage must be foaf:Document, so a dataset's own IRI must differ from
// its landing page (the base uses the landing page as the dataset @id).

const EU_FILE_TYPE = 'http://publications.europa.eu/resource/authority/file-type/'
const EU_FREQUENCY = 'http://publications.europa.eu/resource/authority/frequency/'
const EU_DATA_THEME = 'http://publications.europa.eu/resource/authority/data-theme'
const ADMS_LICENCE_TYPE = 'http://purl.org/adms/licencetype/'

// Formats with no term in the EU file-type authority table (which AgID makes
// mandatory for dct:format) → the closest term that exists. GeoParquet, Parquet,
// GeoJSON, CSV, … are in the table and pass through unchanged.
const IT_FORMAT_FALLBACK: Record<string, string> = {
  PMTILES: 'BIN', // "Binary Data" — no PMTiles term in the EU vocabulary
}

// Well-known licences → the name and ADMS licence type (dct:type, recommended on a
// dcatapit:LicenseDocument). SPDX ids resolve to the licence's IRI, since
// dct:license must be an IRI. Unknown licences are emitted without a dct:type (a
// warning in the AgID validator, not an error).
const KNOWN_LICENCES: { test: RegExp; spdx?: string; iri: string; name: string; type: string }[] = [
  { test: /creativecommons\.org\/publicdomain\/zero\/1\.0/i, spdx: 'CC0-1.0', iri: 'https://creativecommons.org/publicdomain/zero/1.0/', name: 'CC0 1.0', type: 'PublicDomain' },
  { test: /creativecommons\.org\/licenses\/by\/4\.0/i, spdx: 'CC-BY-4.0', iri: 'https://creativecommons.org/licenses/by/4.0/', name: 'CC BY 4.0', type: 'Attribution' },
  { test: /creativecommons\.org\/licenses\/by-sa\/4\.0/i, spdx: 'CC-BY-SA-4.0', iri: 'https://creativecommons.org/licenses/by-sa/4.0/', name: 'CC BY-SA 4.0', type: 'ViralEffect-ShareAlike' },
  { test: /opendatacommons\.org\/licenses\/odbl\/1[-.]0/i, spdx: 'ODbL-1.0', iri: 'https://opendatacommons.org/licenses/odbl/1-0/', name: 'ODbL 1.0', type: 'ViralEffect-ShareAlike' },
  { test: /opendatacommons\.org\/licenses\/pddl\/1[-.]0/i, spdx: 'PDDL-1.0', iri: 'https://opendatacommons.org/licenses/pddl/1-0/', name: 'PDDL 1.0', type: 'PublicDomain' },
  { test: /opendatacommons\.org\/licenses\/by\/1[-.]0/i, spdx: 'ODC-By-1.0', iri: 'https://opendatacommons.org/licenses/by/1-0/', name: 'ODC-By 1.0', type: 'Attribution' },
  { test: /authority\/licence\/CC_BY_4_0$/, iri: '', name: 'CC BY 4.0', type: 'Attribution' },
  { test: /authority\/licence\/CC_BYSA_4_0$/, iri: '', name: 'CC BY-SA 4.0', type: 'ViralEffect-ShareAlike' },
  { test: /authority\/licence\/CC0$/, iri: '', name: 'CC0 1.0', type: 'PublicDomain' },
  { test: /authority\/licence\/ODC_BL$/, iri: '', name: 'ODbL 1.0', type: 'ViralEffect-ShareAlike' },
  { test: /authority\/licence\/ODC_PDDL$/, iri: '', name: 'PDDL 1.0', type: 'PublicDomain' },
  { test: /authority\/licence\/ODC_BY$/, iri: '', name: 'ODC-By 1.0', type: 'Attribution' },
]

const isIri = (v: string): boolean => /^[a-z][a-z0-9+.-]*:/i.test(v)

// A licence value (IRI or SPDX id) → a dcatapit:LicenseDocument description, or
// undefined when it can't be expressed as an IRI. An authored IRI is kept as-is.
function itLicence(v: unknown): { iri: string; name?: string; type?: string } | undefined {
  if (typeof v !== 'string' || !v.trim()) return undefined
  if (isIri(v)) {
    const hit = KNOWN_LICENCES.find((l) => l.test.test(v))
    return { iri: v, name: hit?.name, type: hit?.type }
  }
  const hit = KNOWN_LICENCES.find((l) => l.spdx?.toLowerCase() === v.toLowerCase())
  return hit ? { iri: hit.iri, name: hit.name, type: hit.type } : undefined
}

// An EU frequency IRI from an IRI or bare token. AgID allows …/frequency/UNKNOWN when
// the update frequency isn't known, so that is the default.
function frequencyIri(v?: string): string {
  if (!v?.trim()) return `${EU_FREQUENCY}UNKNOWN`
  return isIri(v) ? v : `${EU_FREQUENCY}${v.trim().toUpperCase()}`
}

// IRI-identified nodes (agents, licences, landing pages) are described once and
// referenced by @id afterwards, so the same agent/licence isn't repeated in every
// dataset (which would also trip the validator's max-cardinality checks on a naive
// store). Blank nodes are always inlined.
function describeOnce(seen: Set<string>, node: JsonLdNode): JsonLdNode {
  const id = node['@id']
  if (typeof id !== 'string') return node
  if (seen.has(id)) return { '@id': id }
  seen.add(id)
  return node
}

// A dcatapit:Agent: dct:identifier + foaf:name are mandatory. Identified by its `uri`
// when given, else a blank node — never by its homepage, because AgID requires
// distinct objects (agent vs. homepage document) to have distinct IRIs.
function itAgentNode(a: DcatAgent | undefined, seen: Set<string>): JsonLdNode | undefined {
  if (!a?.name && !a?.identifier) return undefined
  const node: JsonLdNode = { '@type': ['foaf:Agent', 'dcatapit:Agent'] }
  if (a.uri) node['@id'] = a.uri
  if (a.identifier) node['dct:identifier'] = a.identifier
  if (a.name) node['foaf:name'] = a.name
  if (a.homepage) node['foaf:homepage'] = a.homepage
  if (a.mbox) node['foaf:mbox'] = a.mbox.startsWith('mailto:') ? a.mbox : `mailto:${a.mbox}`
  return describeOnce(seen, node)
}

// A contact point as dcatapit:Organization (vcard:fn + vcard:hasEmail, both mandatory
// when a contact point is given).
function itContactNode(c?: DcatContact): JsonLdNode | undefined {
  if (!c?.fn && !c?.email) return undefined
  const node: JsonLdNode = { '@type': ['vcard:Organization', 'vcard:Kind', 'dcatapit:Organization'] }
  if (c.fn) node['vcard:fn'] = c.fn
  if (c.email) node['vcard:hasEmail'] = c.email.startsWith('mailto:') ? c.email : `mailto:${c.email}`
  return node
}

function itLicenceNode(l: { iri: string; name?: string; type?: string }, seen: Set<string>): JsonLdNode {
  const node: JsonLdNode = { '@id': l.iri, '@type': ['dct:LicenseDocument', 'dcatapit:LicenseDocument'] }
  if (l.name) node['foaf:name'] = l.name
  if (l.type) node['dct:type'] = { '@id': `${ADMS_LICENCE_TYPE}${l.type}` }
  return describeOnce(seen, node)
}

function itDocumentNode(iri: string, seen: Set<string>): JsonLdNode {
  return describeOnce(seen, { '@id': iri, '@type': 'foaf:Document' })
}

// DCAT-AP_IT — DCAT-AP plus the Italian mandatory classes/properties above. Opt-in:
// listed in dcat.config.json `profiles` (or DCAT_PROFILES); no other feed changes.
// Inputs: dcat.config.json `publisher.identifier` (IPA code), per-dataset `dcat`
// overrides `rightsHolder`, `accrualPeriodicity`, `identifier` in datasets.json.
export const dcatApItProfile: DcatProfile = {
  id: 'dcat-ap-it',
  label: 'DCAT-AP_IT (Italy, dati.gov.it)',
  dcatVersion: '3',
  conformsTo: 'http://dati.gov.it/onto/dcatapit',
  context: { ...dcatApProfile.context, dcatapit: NS.dcatapit },
  apply(base, cfg) {
    // Read the per-dataset overrides BEFORE baseAugment strips the `_dcat` carrier.
    // Positionally aligned with the output datasets.
    const overrides = ((base['dcat:dataset'] ?? []) as JsonLdNode[]).map(overridesOf)
    const catalog = baseAugment(base, cfg, this)
    const seen = new Set<string>()

    catalog['@type'] = ['dcat:Catalog', 'dcatapit:Catalog']
    const ctx = catalog['@context'] as Record<string, unknown>
    if (!ctx.foaf) ctx.foaf = NS.foaf
    if (!ctx.vcard) ctx.vcard = NS.vcard
    if (!ctx['dct:type']) ctx['dct:type'] = { '@type': '@id' }
    if (!ctx['dct:rightsHolder']) ctx['dct:rightsHolder'] = { '@type': '@id' }
    if (!ctx['foaf:homepage']) ctx['foaf:homepage'] = { '@type': '@id' }
    if (!ctx['foaf:mbox']) ctx['foaf:mbox'] = { '@type': '@id' }
    if (!ctx['vcard:hasEmail']) ctx['vcard:hasEmail'] = { '@type': '@id' }

    const catPublisher = itAgentNode(cfg.publisher, seen)
    if (catPublisher) catalog['dct:publisher'] = catPublisher
    else delete catalog['dct:publisher']
    if (cfg.homepage) catalog['foaf:homepage'] = itDocumentNode(cfg.homepage, seen)
    // The catalog-level contact point isn't part of DCAT-AP_IT's Catalog; re-type it
    // like the dataset ones so the graph stays consistent.
    const catContact = itContactNode(cfg.contactPoint)
    if (catContact) catalog['dcat:contactPoint'] = catContact

    const catalogModified = catalog['dct:modified'] as string | undefined
    const datasets = (catalog['dcat:dataset'] ?? []) as JsonLdNode[]
    let usesEuThemes = false
    catalog['dcat:dataset'] = datasets.map((raw, i) => {
      const ov = overrides[i] ?? {}
      const ds: JsonLdNode = { ...raw, '@type': ['dcat:Dataset', 'dcatapit:Dataset'] }

      // The dataset's own IRI must differ from its landing page (a foaf:Document).
      const landingPage = ds['dcat:landingPage'] as string | undefined
      if (landingPage) {
        if (ds['@id'] === landingPage) ds['@id'] = `${landingPage}#dataset`
        ds['dcat:landingPage'] = itDocumentNode(landingPage, seen)
      }

      // dct:identifier "<IPA code>:<local id>": an explicit override wins, else the
      // publisher's IPA code prefixes the portal's own id (namespace/slug).
      const ipa = ov.publisher?.identifier ?? cfg.publisher?.identifier
      if (ov.identifier) ds['dct:identifier'] = ov.identifier
      else if (ipa && typeof ds['dct:identifier'] === 'string')
        ds['dct:identifier'] = `${ipa}:${ds['dct:identifier']}`

      // dct:modified is mandatory: the dataset's own date, else its issue date, else
      // the catalog's modification date (the build time).
      if (!ds['dct:modified']) {
        const fallback = (ds['dct:issued'] as string | undefined) ?? catalogModified
        if (fallback) ds['dct:modified'] = fallback
      }

      const publisher = itAgentNode(ov.publisher ?? cfg.publisher, seen)
      if (publisher) ds['dct:publisher'] = publisher
      else delete ds['dct:publisher']

      const rightsHolder = itAgentNode(ov.rightsHolder ?? ov.publisher ?? cfg.publisher, seen)
      if (rightsHolder) ds['dct:rightsHolder'] = rightsHolder

      ds['dct:accrualPeriodicity'] = frequencyIri(ov.accrualPeriodicity ?? cfg.accrualPeriodicity)

      const contact = itContactNode(ov.contactPoint ?? cfg.contactPoint)
      if (contact) ds['dcat:contactPoint'] = contact
      else delete ds['dcat:contactPoint']

      const themes = ds['dcat:theme'] as string[] | undefined
      if (themes?.some((t) => t.startsWith(EU_DATA_THEME))) usesEuThemes = true

      // dct:license is mandatory on every distribution (DCAT-AP_IT moves it there);
      // each one inherits the dataset licence (manifest licenses[0], else the
      // catalog default from dcat.config.json `license`).
      const licence = itLicence(ds['dct:license'])
      if (licence) ds['dct:license'] = licence.iri
      const dists = (ds['dcat:distribution'] ?? []) as JsonLdNode[]
      if (dists.length)
        ds['dcat:distribution'] = dists.map((d) => {
          // New objects: base distributions are shared with every other profile.
          const dist: JsonLdNode = { ...d, '@type': ['dcat:Distribution', 'dcatapit:Distribution'] }
          const fmt = dist['dct:format']
          if (typeof fmt === 'string' && fmt.startsWith(EU_FILE_TYPE)) {
            const fallback = IT_FORMAT_FALLBACK[fmt.slice(EU_FILE_TYPE.length)]
            if (fallback) dist['dct:format'] = `${EU_FILE_TYPE}${fallback}`
          }
          if (licence) dist['dct:license'] = itLicenceNode(licence, seen)
          return dist
        })
      return ds
    })

    if (usesEuThemes && !catalog['dcat:themeTaxonomy']) catalog['dcat:themeTaxonomy'] = EU_DATA_THEME
    return catalog
  },
}

// --- Croissant (MLCommons, schema.org-based ML-dataset metadata) ----------------

// Croissant is NOT a DCAT application profile — it's a schema.org JSON-LD vocabulary
// for ML datasets (https://docs.mlcommons.org/croissant/). It describes a dataset's
// files (cr:FileObject) AND its record structure (cr:RecordSet → cr:Field), the latter
// mapped from the Frictionless Table Schema — which DCAT drops. So this profile
// implements applyFromEntries (it needs schema.fields) and emits JSON-LD only.
//
// A portal has many datasets, a Croissant document describes one, so the emitted feed
// is a schema.org DataCatalog whose `dataset` array holds one Croissant Dataset each;
// the mlcroissant validator checks a single Croissant Dataset, so the validation
// harness extracts each entry and validates it standalone.

// The official Croissant 1.0 JSON-LD context (verbatim from mlcroissant's
// make_context() for a v1.0 document — matched exactly so the validator doesn't flag a
// non-standard context). cr:/sc: namespaces + the ML-dataset term aliases.
const CROISSANT_CONTEXT: Record<string, unknown> = {
  '@language': 'en',
  '@vocab': 'https://schema.org/',
  citeAs: 'cr:citeAs',
  column: 'cr:column',
  conformsTo: 'dct:conformsTo',
  cr: 'http://mlcommons.org/croissant/',
  rai: 'http://mlcommons.org/croissant/RAI/',
  data: { '@id': 'cr:data', '@type': '@json' },
  dataType: { '@id': 'cr:dataType', '@type': '@vocab' },
  dct: 'http://purl.org/dc/terms/',
  equivalentProperty: 'cr:equivalentProperty',
  examples: { '@id': 'cr:examples', '@type': '@json' },
  extract: 'cr:extract',
  field: 'cr:field',
  fileProperty: 'cr:fileProperty',
  fileObject: 'cr:fileObject',
  fileSet: 'cr:fileSet',
  format: 'cr:format',
  includes: 'cr:includes',
  isLiveDataset: 'cr:isLiveDataset',
  jsonPath: 'cr:jsonPath',
  key: 'cr:key',
  md5: 'cr:md5',
  parentField: 'cr:parentField',
  path: 'cr:path',
  recordSet: 'cr:recordSet',
  references: 'cr:references',
  regex: 'cr:regex',
  repeated: 'cr:repeated',
  replace: 'cr:replace',
  samplingRate: 'cr:samplingRate',
  sc: 'https://schema.org/',
  separator: 'cr:separator',
  source: 'cr:source',
  subField: 'cr:subField',
  transform: 'cr:transform',
}

const CROISSANT_VERSION = 'http://mlcommons.org/croissant/1.0'

// IANA media types Croissant's encodingFormat expects (a bare media type, not the
// IRI DCAT-AP uses).
const CROISSANT_MEDIA_TYPES: Record<string, string> = {
  csv: 'text/csv',
  tsv: 'text/tab-separated-values',
  json: 'application/json',
  geojson: 'application/geo+json',
  parquet: 'application/x-parquet',
}

// Frictionless field type → schema.org dataType (Croissant cr:Field.dataType).
const CROISSANT_DATATYPE: Record<string, string> = {
  string: 'sc:Text',
  number: 'sc:Float',
  integer: 'sc:Integer',
  boolean: 'sc:Boolean',
  date: 'sc:Date',
  datetime: 'sc:DateTime',
  time: 'sc:Text',
  year: 'sc:Integer',
  yearmonth: 'sc:Text',
  duration: 'sc:Text',
  geopoint: 'sc:Text',
  geojson: 'sc:Text',
  object: 'sc:Text',
  array: 'sc:Text',
  any: 'sc:Text',
}

// A dataset's resources, uniformly whether it's a single-file dataset or a bundle.
function resourcesOf(entry: CroissantEntry): ResourceDescriptor[] {
  if (Array.isArray(entry.resources)) return entry.resources
  if (entry.file) return [{ path: entry.file, format: entry.format, title: entry.title, schema: entry.schema }]
  return []
}

// The subset of a manifest entry Croissant reads (plus the build-time file hashes the
// generator attaches). Kept structural — the provider Dataset is assignable.
type CroissantEntry = CatalogEntry & {
  _hashes?: Record<string, string>
}

// The site base URL (SITE_URL) toDCATCatalog resolved this dataset's links against.
// Profiles don't receive it, but the landing page is `<base>/@<namespace>/<slug>`, so
// strip that suffix ('' for a root-relative feed). Undefined when the dataset has no
// such landing page (e.g. no namespace/slug).
function siteBaseOf(entry: CroissantEntry, url?: string): string | undefined {
  if (!url || !entry.namespace || !entry.slug) return undefined
  const suffix = `/@${entry.namespace}/${entry.slug}`
  return url.endsWith(suffix) ? url.slice(0, -suffix.length) : undefined
}

// A valid Croissant/schema.org `name` token: [a-zA-Z0-9\-_\.]+
function croissantName(s: string): string {
  return s.replace(/[^a-zA-Z0-9\-_.]+/g, '_').replace(/^_+|_+$/g, '') || 'dataset'
}

// Origin (scheme://host) of an absolute URL, else '' (root-relative fallback).
function originOf(v: unknown): string {
  const m = typeof v === 'string' ? /^(https?:\/\/[^/]+)/.exec(v) : null
  return m ? m[1] : ''
}

function croissantMediaType(format?: string): string | undefined {
  return format ? CROISSANT_MEDIA_TYPES[format.toLowerCase()] ?? undefined : undefined
}

// Build one Croissant Dataset node from an entry, using the positionally-aligned base
// DCAT dataset for resolved URLs (landing page + download URLs carry SITE_URL).
function croissantDataset(entry: CroissantEntry, baseDs: JsonLdNode): JsonLdNode {
  const url = (baseDs['@id'] ?? baseDs['dcat:landingPage']) as string | undefined
  const origin = originOf(url) || originOf((baseDs['dcat:distribution'] as JsonLdNode[])?.[0]?.['dcat:downloadURL'])
  const name = croissantName((entry.namespace && entry.slug ? `${entry.namespace}_${entry.slug}` : entry.slug ?? entry.name ?? 'dataset'))
  // Resolve resource paths exactly as toDCAT resolved the base distributions'
  // downloadURLs (absolute URLs as-is, bare filenames under <site>/data/).
  const siteBase = siteBaseOf(entry, url) ?? origin

  const resources = resourcesOf(entry)
  const distribution: JsonLdNode[] = []
  const recordSet: JsonLdNode[] = []

  resources.forEach((res) => {
    const foId = `${name}/${croissantName(res.path)}`
    const contentUrl = resolveResourceUrl(res.path, siteBase)
    const fo: JsonLdNode = {
      '@type': 'cr:FileObject',
      '@id': foId,
      name: foId,
      contentUrl,
    }
    const mt = croissantMediaType(res.format)
    if (mt) fo.encodingFormat = mt
    // Croissant requires a checksum on a directly-hosted FileObject; the generator
    // hashes local files. Omitted (with a validator warning) for remote-only files.
    const sha = entry._hashes?.[res.path]
    if (sha) fo.sha256 = sha
    distribution.push(fo)

    const fields = res.schema?.fields ?? []
    if (fields.length) {
      const rsName = `${name}/${croissantName(res.title ?? res.path)}_records`
      recordSet.push({
        '@type': 'cr:RecordSet',
        '@id': rsName,
        name: rsName,
        field: fields.map((f) => {
          const fId = `${rsName}/${croissantName(f.name)}`
          const field: JsonLdNode = {
            '@type': 'cr:Field',
            '@id': fId,
            name: fId,
            dataType: CROISSANT_DATATYPE[f.type ?? 'string'] ?? 'sc:Text',
            source: { fileObject: { '@id': foId }, extract: { column: f.name } },
          }
          if (f.description) field.description = f.description
          return field
        }),
      })
    }
  })

  const ds: JsonLdNode = {
    '@type': 'sc:Dataset',
    '@id': url ?? name,
    name,
    conformsTo: CROISSANT_VERSION,
    description: (baseDs['dct:description'] as string) ?? entry.description ?? entry.title ?? name,
  }
  // A human title (schema.org alternateName) alongside the identifier `name`.
  const title = (baseDs['dct:title'] as string) ?? entry.title ?? entry.name
  if (title && title !== name) ds.alternateName = title
  if (url) ds.url = url
  const license = baseDs['dct:license']
  if (license) ds.license = license
  const keywords = (baseDs['dcat:keyword'] as string[]) ?? entry.keywords
  if (keywords?.length) ds.keywords = keywords
  const issued = baseDs['dct:issued']
  if (issued) ds.datePublished = issued
  const modified = baseDs['dct:modified']
  if (modified) ds.dateModified = modified
  const version = baseDs['dcat:version'] ?? entry.version
  if (version) ds.version = version
  if (distribution.length) ds.distribution = distribution
  if (recordSet.length) ds.recordSet = recordSet
  return ds
}

// Build the schema.org DataCatalog of Croissant Datasets. `entries` supply the field
// schema + resources + file hashes; `base` supplies resolved URLs/metadata, aligned by
// index. When entries is empty (the apply() fallback), datasets are built from base
// alone (distribution-only, no recordSets).
function buildCroissant(entries: CroissantEntry[], base: DcatCatalog, cfg: DcatConfig): ProfiledCatalog {
  const baseDatasets = (base['dcat:dataset'] ?? []) as JsonLdNode[]
  const catalog: ProfiledCatalog = {
    '@context': { ...CROISSANT_CONTEXT },
    '@type': 'sc:DataCatalog',
    name: cfg.title ?? (base['dct:title'] as string) ?? 'Data catalog',
    description: cfg.description ?? (base['dct:description'] as string) ?? 'Catalog of datasets.',
  }
  if (cfg.homepage) catalog.url = cfg.homepage
  catalog.dataset = baseDatasets.map((baseDs, i) => croissantDataset(entries[i] ?? {}, baseDs))
  return catalog
}

export const croissantProfile: DcatProfile = {
  id: 'croissant',
  label: 'Croissant (MLCommons / schema.org)',
  dcatVersion: '3',
  conformsTo: CROISSANT_VERSION,
  context: {},
  serializations: ['jsonld'],
  apply(base, cfg) {
    return buildCroissant([], base, cfg)
  },
  applyFromEntries(entries, base, cfg) {
    return buildCroissant(entries as CroissantEntry[], base, cfg)
  },
}

// --- national profiles (pluggable, data-driven) ---------------------------------

// A national profile is DCAT-AP plus a national conformsTo URI and (optionally) a
// few extra namespaces. Defining one is data, not code — so more countries slot in
// without touching this module's logic. `makeNationalProfile` builds one from
// DCAT-AP; register it via registerDcatProfile().
export function makeNationalProfile(opts: {
  id: string
  label: string
  conformsTo?: string
  context?: Record<string, string>
}): DcatProfile {
  return {
    id: opts.id,
    label: opts.label,
    dcatVersion: '3',
    conformsTo: opts.conformsTo ?? dcatApProfile.conformsTo,
    context: { ...dcatApProfile.context, ...(opts.context ?? {}) },
    apply(base, cfg) {
      return baseAugment(base, cfg, this)
    },
  }
}

// A few national profiles ship built-in as examples of the plug mechanism. Add more
// via registerDcatProfile(makeNationalProfile({...})) — see dcat.config.json.
export const dcatApSeProfile = makeNationalProfile({
  id: 'dcat-ap-se',
  label: 'DCAT-AP-SE (Sweden)',
  conformsTo: 'https://docs.dataportal.se/dcat/en/',
})
export const dcatApChProfile = makeNationalProfile({
  id: 'dcat-ap-ch',
  label: 'DCAT-AP-CH (Switzerland)',
  conformsTo: 'https://www.dcat-ap.ch/',
})
export const dcatApDeProfile = makeNationalProfile({
  id: 'dcat-ap-de',
  label: 'DCAT-AP.de (Germany)',
  conformsTo: 'http://dcat-ap.de/def/dcatde/',
  context: { dcatde: NS.dcatde },
})

// --- registry -------------------------------------------------------------------

const registry = new Map<string, DcatProfile>()
function register(p: DcatProfile) {
  registry.set(p.id, p)
}
for (const p of [
  dcat3Profile,
  dcat2Profile,
  dcatApProfile,
  dcatUsProfile,
  geodcatApProfile,
  croissantProfile,
  dcatApSeProfile,
  dcatApChProfile,
  dcatApDeProfile,
  dcatApItProfile,
]) {
  register(p)
}

// Register (or replace) a DCAT profile by id — the plug point for national profiles.
export function registerDcatProfile(profile: DcatProfile): void {
  register(profile)
}

// Resolve a profile by id, falling back to plain DCAT-3 for an unknown id.
export function getDcatProfile(id?: string): DcatProfile {
  return (id && registry.get(id)) || dcat3Profile
}

// All registered profiles (for the skill / an admin surface).
export function listDcatProfiles(): DcatProfile[] {
  return Array.from(registry.values())
}
