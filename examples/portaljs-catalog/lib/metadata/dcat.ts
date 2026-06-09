// DCAT interop — DESIGNED-IN, NOT BUILT.
//
// The metadata-profile contract (./types.ts) is Frictionless-native: a dataset is
// authored as a Frictionless Data Package (Table Schema + descriptor fields). DCAT
// / DCAT-AP is the *serialization + harvest* layer ON TOP of that model — the
// interop format a portal exposes (e.g. a /catalog.jsonld) so external catalogs and
// government data portals can harvest it, and ingests when importing from one.
//
// This file pins the contract — the types and the two function signatures — so the
// rest of the system can reference DCAT without it existing yet. The actual mapping
// is built in the DCAT-interop phase (a separate bead). DO NOT implement the field
// mapping here.
//
// Mapping sketch (for the implementer of that phase):
//   PackageMetadata.title       -> dct:title
//   PackageMetadata.description  -> dct:description
//   PackageMetadata.keywords[]   -> dcat:keyword[]
//   PackageMetadata.licenses[]   -> dct:license
//   PackageMetadata.modified     -> dct:modified
//   Dataset.file/format          -> dcat:distribution[] (dcat:Distribution)
//   TableSchema.fields[]         -> a Frictionless schema reference or
//                                   csvw/dcat:Distribution describedBy link
// Spec: https://www.w3.org/TR/vocab-dcat-3/ · DCAT-AP for EU data portals.

import type { PackageMetadata, TableSchema } from './types'

// A minimal JSON-LD-shaped DCAT Dataset node. Expanded in the DCAT-interop phase.
export type DcatDistribution = {
  '@type': 'dcat:Distribution'
  'dcat:accessURL'?: string
  'dcat:mediaType'?: string
  'dct:format'?: string
}

export type DcatDataset = {
  '@context'?: Record<string, string>
  '@type': 'dcat:Dataset'
  'dct:title'?: string
  'dct:description'?: string
  'dcat:keyword'?: string[]
  'dct:license'?: string
  'dct:modified'?: string
  'dcat:distribution'?: DcatDistribution[]
}

// The Frictionless-native shape this maps to/from. Mirrors what a Dataset carries
// (kept structural to avoid a dependency on lib/providers).
export type FrictionlessLike = PackageMetadata & {
  name?: string
  file?: string
  format?: string
  schema?: TableSchema
}

const NOT_BUILT =
  'DCAT interop is designed-in but not yet built — see lib/metadata/dcat.ts and the DCAT-interop phase.'

// Serialize a dataset's Frictionless-native metadata to a DCAT Dataset node.
// Built in the DCAT-interop phase.
export function toDCAT(_dataset: FrictionlessLike): DcatDataset {
  throw new Error(NOT_BUILT)
}

// Parse a DCAT Dataset node into the Frictionless-native shape (harvest / import).
// Built in the DCAT-interop phase.
export function fromDCAT(_dcat: DcatDataset): FrictionlessLike {
  throw new Error(NOT_BUILT)
}
