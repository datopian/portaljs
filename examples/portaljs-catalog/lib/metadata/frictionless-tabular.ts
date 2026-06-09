// L0 default profile: the Frictionless Tabular Data Package.
//
// This is the registered default (id `frictionless-tabular`). It does not pin its
// own schema — it validates whatever Table Schema a dataset declares against the
// dataset's loaded rows: type-coercion + the constraint subset we can check
// cheaply. Deep, spec-complete row validation (every Frictionless rule, all
// formats) is a TODO — at L0 this is enough to catch the common authoring errors
// (wrong type, missing required value, out-of-enum, duplicate key).

import type {
  Field,
  MetadataProfile,
  TableSchema,
  ValidationInput,
  ValidationIssue,
  ValidationResult,
} from './types'

const DEFAULT_MISSING_VALUES = ['']

function isMissing(value: unknown, missingValues: string[]): boolean {
  if (value === null || value === undefined) return true
  return missingValues.includes(String(value))
}

// True when `value` (as authored in a CSV cell, i.e. a string) is coercible to the
// declared field type. Permissive by design — we flag clear mismatches, not every
// edge of the Frictionless format grammar.
function coercesTo(value: unknown, type: Field['type']): boolean {
  const s = String(value).trim()
  switch (type) {
    case 'integer':
      return /^[+-]?\d+$/.test(s)
    case 'number':
      return s !== '' && !Number.isNaN(Number(s))
    case 'year':
      return /^\d{4}$/.test(s)
    case 'boolean':
      return ['true', 'false', '0', '1', 'yes', 'no'].includes(s.toLowerCase())
    case 'date':
    case 'datetime':
    case 'time':
      return !Number.isNaN(Date.parse(s))
    case 'geopoint':
      // "lon, lat"
      return /^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(s)
    // string / object / array / geojson / duration / any — accept as-is at L0.
    default:
      return true
  }
}

function asNumber(v: number | string | undefined): number | undefined {
  if (v === undefined) return undefined
  const n = Number(v)
  return Number.isNaN(n) ? undefined : n
}

function checkConstraints(
  field: Field,
  value: unknown,
  rowIndex: number,
  errors: ValidationIssue[]
): void {
  const c = field.constraints
  if (!c) return
  const s = String(value)

  if (c.enum && !c.enum.map(String).includes(s)) {
    errors.push({
      field: field.name,
      row: rowIndex,
      message: `value "${s}" is not in enum [${c.enum.join(', ')}]`,
    })
  }
  if (c.pattern && !new RegExp(c.pattern).test(s)) {
    errors.push({
      field: field.name,
      row: rowIndex,
      message: `value "${s}" does not match pattern /${c.pattern}/`,
    })
  }
  if (c.minLength !== undefined && s.length < c.minLength) {
    errors.push({
      field: field.name,
      row: rowIndex,
      message: `value "${s}" is shorter than minLength ${c.minLength}`,
    })
  }
  if (c.maxLength !== undefined && s.length > c.maxLength) {
    errors.push({
      field: field.name,
      row: rowIndex,
      message: `value "${s}" is longer than maxLength ${c.maxLength}`,
    })
  }
  const min = asNumber(c.minimum)
  const max = asNumber(c.maximum)
  const n = Number(s)
  if (min !== undefined && !Number.isNaN(n) && n < min) {
    errors.push({
      field: field.name,
      row: rowIndex,
      message: `value ${s} is below minimum ${min}`,
    })
  }
  if (max !== undefined && !Number.isNaN(n) && n > max) {
    errors.push({
      field: field.name,
      row: rowIndex,
      message: `value ${s} is above maximum ${max}`,
    })
  }
}

function validateSchemaShape(
  schema: TableSchema,
  errors: ValidationIssue[]
): void {
  if (!Array.isArray(schema.fields) || schema.fields.length === 0) {
    errors.push({ message: 'schema has no fields' })
    return
  }
  const seen = new Set<string>()
  for (const f of schema.fields) {
    if (!f.name) errors.push({ message: 'a field is missing a name' })
    if (f.name && seen.has(f.name)) {
      errors.push({ field: f.name, message: 'duplicate field name' })
    }
    seen.add(f.name)
  }
  const keys = Array.isArray(schema.primaryKey)
    ? schema.primaryKey
    : schema.primaryKey
    ? [schema.primaryKey]
    : []
  for (const k of keys) {
    if (!seen.has(k)) {
      errors.push({ message: `primaryKey "${k}" is not a declared field` })
    }
  }
}

function validateRows(
  schema: TableSchema,
  rows: Record<string, unknown>[],
  errors: ValidationIssue[]
): void {
  const missingValues = schema.missingValues ?? DEFAULT_MISSING_VALUES
  const keys = Array.isArray(schema.primaryKey)
    ? schema.primaryKey
    : schema.primaryKey
    ? [schema.primaryKey]
    : []
  const seenKeys = new Set<string>()
  const uniqueSeen: Record<string, Set<string>> = {}

  rows.forEach((row, rowIndex) => {
    for (const field of schema.fields) {
      const value = row[field.name]
      const missing = isMissing(value, missingValues)

      if (missing) {
        if (field.constraints?.required) {
          errors.push({
            field: field.name,
            row: rowIndex,
            message: 'required value is missing',
          })
        }
        continue // nothing else to check on a missing cell
      }

      if (field.type && !coercesTo(value, field.type)) {
        errors.push({
          field: field.name,
          row: rowIndex,
          message: `value "${String(value)}" is not a valid ${field.type}`,
        })
      }
      checkConstraints(field, value, rowIndex, errors)

      if (field.constraints?.unique) {
        const set = (uniqueSeen[field.name] ??= new Set())
        const sv = String(value)
        if (set.has(sv)) {
          errors.push({
            field: field.name,
            row: rowIndex,
            message: `duplicate value "${sv}" violates unique constraint`,
          })
        }
        set.add(sv)
      }
    }

    if (keys.length) {
      const composite = keys.map((k) => String(row[k])).join(' ')
      if (seenKeys.has(composite)) {
        errors.push({
          row: rowIndex,
          message: `duplicate primaryKey (${keys.join(', ')})`,
        })
      }
      seenKeys.add(composite)
    }
  })
}

export const frictionlessTabularProfile: MetadataProfile = {
  id: 'frictionless-tabular',
  name: 'Frictionless Tabular Data Package',
  version: '1.0.0',
  // No pinned schema — L0 validates the dataset's own declared schema.
  schema: undefined,

  validate(input: ValidationInput): ValidationResult {
    const errors: ValidationIssue[] = []
    const warnings: ValidationIssue[] = []

    const { schema, rows } = input
    if (!schema) {
      // No schema declared: valid (a dataset may ship metadata-only), but warn —
      // surfaces render less without a schema.
      warnings.push({ message: 'no Table Schema declared' })
      return { valid: true, errors, warnings }
    }

    validateSchemaShape(schema, errors)
    if (errors.length === 0 && rows && rows.length) {
      validateRows(schema, rows, errors)
    } else if (!rows) {
      warnings.push({
        message: 'rows not provided — only the schema shape was checked',
      })
    }

    return { valid: errors.length === 0, errors, warnings }
  },
}
