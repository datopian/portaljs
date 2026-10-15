// DCAT feed validation — the honest conformance gate.
//
// A national/EU/US harvester rejects a feed that's missing the profile's mandatory
// classes/properties. This checks a profiled catalog against the mandatory + strongly
// recommended fields of its profile and reports what's missing, so the portal author
// fixes it BEFORE claiming conformance (rather than shipping a feed data.europa.eu
// silently drops).
//
// This is a structural, dependency-free check — NOT a full SHACL validation. The
// authoritative check is the profile's SHACL shapes (DCAT-AP ships them) or the
// data.europa.eu / resources.data.gov validator; run those in the skill's verify
// step. This catches the common, high-signal gaps early.

import type { JsonLdNode } from './dcat-profiles'
import type { ValidationIssue, ValidationResult } from './types'

type Rule = { path: string; label: string; level: 'error' | 'warning' }

// Catalog-level rules per profile family.
const CATALOG_RULES: Record<string, Rule[]> = {
  'dcat-ap': [
    { path: 'dct:title', label: 'catalog title', level: 'error' },
    { path: 'dct:description', label: 'catalog description', level: 'error' },
    { path: 'dct:publisher', label: 'catalog publisher (dct:publisher)', level: 'error' },
  ],
  'dcat-us': [
    { path: 'dct:title', label: 'catalog title', level: 'error' },
    { path: 'dct:description', label: 'catalog description', level: 'error' },
    { path: 'dct:publisher', label: 'catalog publisher (dct:publisher)', level: 'error' },
  ],
  // DCAT-AP_IT (AgID) — the catalog's mandatory elements. Agents (publisher) are
  // checked in depth by checkDcatApIt below.
  'dcat-ap-it': [
    { path: 'dct:title', label: 'catalog title', level: 'error' },
    { path: 'dct:description', label: 'catalog description', level: 'error' },
    { path: 'dct:publisher', label: 'catalog publisher (dct:publisher)', level: 'error' },
    { path: 'dct:modified', label: 'catalog modification date (dct:modified)', level: 'error' },
    { path: 'dcat:dataset', label: 'datasets (dcat:dataset)', level: 'error' },
    { path: 'foaf:homepage', label: 'catalog homepage (foaf:homepage)', level: 'warning' },
    { path: 'dct:language', label: 'catalog language (dct:language)', level: 'warning' },
  ],
  // Croissant is schema.org-shaped (sc:DataCatalog): name/description, not dct:title.
  // The authoritative gate is mlcroissant — this catches the high-signal gaps only.
  croissant: [
    { path: 'name', label: 'catalog name', level: 'error' },
    { path: 'description', label: 'catalog description', level: 'error' },
  ],
}

// Dataset-level rules per profile family.
const DATASET_RULES: Record<string, Rule[]> = {
  'dcat-ap': [
    { path: 'dct:title', label: 'title', level: 'error' },
    { path: 'dct:description', label: 'description', level: 'error' },
    { path: 'dct:publisher', label: 'publisher (dct:publisher)', level: 'warning' },
    { path: 'dcat:contactPoint', label: 'contact point (dcat:contactPoint)', level: 'warning' },
    { path: 'dcat:theme', label: 'theme (dcat:theme, EU data-theme vocab)', level: 'warning' },
    { path: 'dcat:distribution', label: 'distribution', level: 'warning' },
  ],
  'dcat-us': [
    { path: 'dct:title', label: 'title', level: 'error' },
    { path: 'dct:description', label: 'description', level: 'error' },
    { path: 'dct:publisher', label: 'publisher (dct:publisher)', level: 'error' },
    { path: 'dcat:contactPoint', label: 'contact point (fn + hasEmail)', level: 'error' },
    { path: 'dct:accessLevel', label: 'access level (dct:accessLevel)', level: 'error' },
    { path: 'dct:identifier', label: 'identifier', level: 'warning' },
  ],
  // Croissant datasets are schema.org sc:Dataset (name/description/distribution).
  croissant: [
    { path: 'name', label: 'name', level: 'error' },
    { path: 'description', label: 'description', level: 'error' },
    { path: 'distribution', label: 'distribution (cr:FileObject)', level: 'warning' },
  ],
  // DCAT-AP_IT (AgID) — the dataset's mandatory elements (dcat:distribution is
  // mandatory for open data). Agents, distributions and contact points are checked
  // in depth by checkDcatApIt below.
  'dcat-ap-it': [
    { path: 'dct:identifier', label: 'identifier (dct:identifier, "<IPA code>:<id>")', level: 'error' },
    { path: 'dct:title', label: 'title', level: 'error' },
    { path: 'dct:description', label: 'description', level: 'error' },
    { path: 'dct:modified', label: 'modification date (dct:modified)', level: 'error' },
    { path: 'dcat:theme', label: 'theme (dcat:theme, EU data-theme vocab — set `themes` in dcat.config.json or the dataset `dcat` block)', level: 'error' },
    { path: 'dct:rightsHolder', label: 'rights holder (dct:rightsHolder — set `dcat.rightsHolder` or the catalog publisher)', level: 'error' },
    { path: 'dct:accrualPeriodicity', label: 'update frequency (dct:accrualPeriodicity)', level: 'error' },
    { path: 'dcat:distribution', label: 'distribution', level: 'error' },
    { path: 'dcat:contactPoint', label: 'contact point (dcat:contactPoint)', level: 'warning' },
    { path: 'dct:publisher', label: 'publisher (dct:publisher)', level: 'warning' },
  ],
}

// --- DCAT-AP_IT nested checks ----------------------------------------------------

const asArray = (v: unknown): JsonLdNode[] =>
  (Array.isArray(v) ? v : v === undefined || v === null ? [] : [v]).filter(
    (x): x is JsonLdNode => Boolean(x) && typeof x === 'object'
  )

// The full description of every IRI-identified node in the catalog. The dcat-ap-it
// profile describes an agent/licence once and references it by @id elsewhere, so a
// nested check resolves a bare {'@id'} reference here.
function indexById(root: unknown, out = new Map<string, JsonLdNode>()): Map<string, JsonLdNode> {
  if (Array.isArray(root)) root.forEach((r) => indexById(r, out))
  else if (root && typeof root === 'object') {
    const node = root as JsonLdNode
    const id = node['@id']
    if (typeof id === 'string' && Object.keys(node).length > 1 && !out.has(id)) out.set(id, node)
    for (const [k, v] of Object.entries(node)) if (k !== '@context') indexById(v, out)
  }
  return out
}

// What DCAT-AP_IT requires below the top level: agents (dct:identifier + foaf:name),
// distributions (dct:format, dcat:accessURL, dct:license), contact points (vcard:fn +
// vcard:hasEmail) and the "<IPA code>:<id>" identifier form.
function checkDcatApIt(catalog: JsonLdNode, errors: ValidationIssue[], warnings: ValidationIssue[]) {
  const byId = indexById(catalog)
  const resolve = (n: JsonLdNode) =>
    typeof n['@id'] === 'string' && Object.keys(n).length === 1 ? byId.get(n['@id']) ?? n : n
  const agent = (where: string, v: unknown, row?: number) => {
    for (const a of asArray(v).map(resolve)) {
      if (!isPresent(a, 'dct:identifier'))
        errors.push({ row, message: `${where}: agent missing dct:identifier (IPA code, or VAT number for a private body — set \`identifier\`)` })
      if (!isPresent(a, 'foaf:name')) errors.push({ row, message: `${where}: agent missing foaf:name` })
    }
  }
  const contact = (where: string, v: unknown, row?: number) => {
    for (const c of asArray(v)) {
      if (!isPresent(c, 'vcard:fn')) errors.push({ row, message: `${where}: contact point missing vcard:fn` })
      if (!isPresent(c, 'vcard:hasEmail')) errors.push({ row, message: `${where}: contact point missing vcard:hasEmail` })
    }
  }

  agent('catalog publisher', catalog['dct:publisher'])
  ;((catalog['dcat:dataset'] as JsonLdNode[]) ?? []).forEach((ds, i) => {
    const id = (ds['dct:identifier'] ?? ds['@id'] ?? `#${i}`) as string
    agent(`dataset ${id} rights holder`, ds['dct:rightsHolder'], i)
    agent(`dataset ${id} publisher`, ds['dct:publisher'], i)
    contact(`dataset ${id}`, ds['dcat:contactPoint'], i)
    if (typeof ds['dct:identifier'] === 'string' && !/^[^:\s/]+:\S+$/.test(ds['dct:identifier']))
      warnings.push({ row: i, message: `dataset ${id}: dct:identifier is not in the "<IPA code>:<id>" form — set \`publisher.identifier\` in dcat.config.json` })
    asArray(ds['dcat:distribution']).forEach((dist, j) => {
      const where = `dataset ${id} distribution #${j + 1}`
      if (!isPresent(dist, 'dct:format')) errors.push({ row: i, message: `${where}: missing dct:format (EU file-type)` })
      if (!isPresent(dist, 'dcat:accessURL')) errors.push({ row: i, message: `${where}: missing dcat:accessURL` })
      if (!isPresent(dist, 'dct:license'))
        errors.push({ row: i, message: `${where}: missing dct:license — set the dataset's licenses (an IRI or known SPDX id) or \`license\` in dcat.config.json` })
      for (const l of asArray(dist['dct:license']).map(resolve))
        if (!isPresent(l, 'dct:type'))
          warnings.push({ row: i, message: `${where}: licence ${l['@id']} has no dct:type (ADMS licence type) — not a recognised licence` })
    })
  })
}

// The array of dataset nodes — DCAT catalogs key it dcat:dataset; the schema.org
// Croissant DataCatalog keys it `dataset`.
function datasetsOf(catalog: JsonLdNode, profileId: string): JsonLdNode[] {
  const key = profileId === 'croissant' ? 'dataset' : 'dcat:dataset'
  return (catalog[key] as JsonLdNode[]) ?? []
}

// A profile with its own table (dcat-ap-it) uses it; other national profiles inherit
// DCAT-AP's rule set; GeoDCAT-AP is DCAT-AP + spatial.
function rulesFor(profileId: string, kind: 'catalog' | 'dataset'): Rule[] {
  const table = kind === 'catalog' ? CATALOG_RULES : DATASET_RULES
  if (table[profileId]) return table[profileId]
  if (profileId === 'geodcat-ap' || profileId.startsWith('dcat-ap')) return table['dcat-ap'] ?? []
  return [] // plain dcat-2 / dcat-3 have no mandatory-profile requirements
}

function isPresent(node: JsonLdNode, path: string): boolean {
  const v = node[path]
  if (v === undefined || v === null) return false
  if (typeof v === 'string') return v.trim().length > 0
  if (Array.isArray(v)) return v.length > 0
  return true
}

// Validate a profiled catalog against its profile's mandatory/recommended fields.
export function validateDcat(catalog: JsonLdNode, profileId: string): ValidationResult {
  const errors: ValidationIssue[] = []
  const warnings: ValidationIssue[] = []

  for (const rule of rulesFor(profileId, 'catalog')) {
    if (!isPresent(catalog, rule.path)) {
      const issue = { message: `catalog: missing ${rule.label}` }
      ;(rule.level === 'error' ? errors : warnings).push(issue)
    }
  }

  const datasets = datasetsOf(catalog, profileId)
  const dsRules = rulesFor(profileId, 'dataset')
  datasets.forEach((ds, i) => {
    const id = (ds['dct:identifier'] ?? ds['@id'] ?? `#${i}`) as string
    for (const rule of dsRules) {
      if (!isPresent(ds, rule.path)) {
        const issue = { row: i, message: `dataset ${id}: missing ${rule.label}` }
        ;(rule.level === 'error' ? errors : warnings).push(issue)
      }
    }
  })

  if (profileId === 'dcat-ap-it') checkDcatApIt(catalog, errors, warnings)

  return { valid: errors.length === 0, errors, warnings }
}
