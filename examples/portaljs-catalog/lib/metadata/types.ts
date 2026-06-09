// The metadata-profile contract.
//
// Where the data-provider contract (lib/providers) answers *which datasets exist*
// and the data-query contract (lib/query) answers *how to compute over a dataset's
// data*, this contract answers *how a dataset's schema + descriptive metadata are
// authored and surfaced*.
//
// The model is Frictionless-native: a dataset declares a Frictionless **Table
// Schema** (its fields/types/constraints) plus the **Data Package** descriptor
// fields a catalog cares about (title, licenses, sources, keywords, ...). DCAT /
// DCAT-AP is a serialization + harvest layer ON TOP of this (see ./dcat.ts) — it is
// designed-in here and built in the later DCAT-interop phase.
//
// Surfaces (the /@<namespace>/<slug> showcase) and skills branch on a
// `MetadataProfile` rather than hard-coding a schema shape — the L0→L3 ladder in
// ./README.md is the same decoupling idea as the provider/query seams.

// Frictionless Table Schema field types.
// https://specs.frictionlessdata.io/table-schema/#types-and-formats
export type FieldType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'time'
  | 'year'
  | 'yearmonth'
  | 'duration'
  | 'geopoint'
  | 'geojson'
  | 'object'
  | 'array'
  | 'any'

// Per-field constraints. A subset of the Frictionless constraint vocabulary — the
// ones an L0 catalog can check against a loaded CSV without a full validator.
export type FieldConstraints = {
  required?: boolean
  unique?: boolean
  enum?: (string | number)[]
  minimum?: number | string
  maximum?: number | string
  minLength?: number
  maxLength?: number
  pattern?: string
}

// One column descriptor.
export type Field = {
  name: string
  type?: FieldType
  // Type-specific format, e.g. a date `format` like 'default' or '%Y-%m-%d'.
  format?: string
  title?: string
  description?: string
  constraints?: FieldConstraints
}

// A Frictionless Table Schema — the field-level contract for tabular data.
export type TableSchema = {
  fields: Field[]
  // Field name (or names, for a composite key) that uniquely identifies a row.
  primaryKey?: string | string[]
  // Cell values to treat as missing/null (Frictionless defaults to [""]).
  missingValues?: string[]
}

// The Data Package descriptor fields a catalog surfaces. These live alongside the
// schema and map cleanly onto DCAT later (title→dct:title, licenses→dct:license,
// keywords→dcat:keyword, ...).
export type License = { name?: string; path?: string; title?: string }
export type Source = { title: string; path?: string; email?: string }

export type PackageMetadata = {
  title?: string
  description?: string
  licenses?: License[]
  sources?: Source[]
  keywords?: string[]
  // ISO 8601 timestamps.
  created?: string
  modified?: string
  version?: string
}

// What a profile's validate() receives: the declared schema/metadata plus, when
// available, the dataset's loaded rows (e.g. parsed CSV). Rows are optional so a
// profile can still check the schema is well-formed at build time without data.
// Kept structural (not the providers' Dataset) so lib/metadata has no dependency
// on lib/providers — the dependency runs the other way.
export type ValidationInput = {
  schema?: TableSchema
  metadata?: PackageMetadata
  rows?: Record<string, unknown>[]
}

export type ValidationIssue = {
  field?: string
  // 0-based row index when the issue is row-level.
  row?: number
  message: string
}

export type ValidationResult = {
  valid: boolean
  errors: ValidationIssue[]
  warnings: ValidationIssue[]
}

// The metadata-profile contract. A profile is a named, versioned schema + a
// validator. Surfaces and skills resolve one through the registry (./registry.ts)
// and branch on it instead of assuming a fixed shape.
export interface MetadataProfile {
  readonly id: string
  readonly name: string
  readonly version: string
  // The profile's own template schema, when it pins one (L0's is undefined — it
  // validates against whatever schema the dataset declares).
  readonly schema?: TableSchema
  validate(input: ValidationInput): ValidationResult
}
