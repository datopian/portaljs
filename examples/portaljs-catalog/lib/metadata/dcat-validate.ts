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
}

// The array of dataset nodes — DCAT catalogs key it dcat:dataset; the schema.org
// Croissant DataCatalog keys it `dataset`.
function datasetsOf(catalog: JsonLdNode, profileId: string): JsonLdNode[] {
  const key = profileId === 'croissant' ? 'dataset' : 'dcat:dataset'
  return (catalog[key] as JsonLdNode[]) ?? []
}

// National profiles inherit DCAT-AP's rule set; GeoDCAT-AP is DCAT-AP + spatial.
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

  return { valid: errors.length === 0, errors, warnings }
}
