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

import type { DcatCatalog } from './dcat'

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
  // Augment a base DCAT-3 catalog (from toDCATCatalog) into this profile.
  apply(base: DcatCatalog, cfg: DcatConfig): ProfiledCatalog
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
  dcatApSeProfile,
  dcatApChProfile,
  dcatApDeProfile,
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
