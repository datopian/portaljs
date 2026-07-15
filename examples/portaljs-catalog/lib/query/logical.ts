// The LOGICAL query surface — the layer that lets a non-technical visitor query a
// geo dataset without ever seeing the geometry/bbox plumbing (epic po-0qe.6.3 §4b).
//
// A GeoParquet twin carries three kinds of column: the attribute columns a user
// cares about (often under terse database names like PROP_TYPE), a `geometry`
// column (the shape), and a covering `bbox` STRUCT used to prune Parquet row
// groups. The raw SQL to query it — `SELECT * EXCLUDE(geometry,bbox),
// ST_AsGeoJSON(geometry) … WHERE bbox.xmin <= … AND ST_Intersects(…)` — is
// bookkeeping no casual user should type.
//
// This module hides all of it behind a clean `data` VIEW:
//
//   • attribute columns are ALIASED to their human field titles (Property Type,
//     not PROP_TYPE — carried in the Frictionless schema, or the raw name when
//     there's no alias),
//   • the geometry/bbox columns are kept under their raw names but never surface
//     in a result (the map wrapper serializes + excludes them),
//   • the viewport clip ("limit to map view") is applied at the VIEW level, so the
//     SQL a user reads/writes stays free of bbox predicates.
//
// So a user's mental model is just `SELECT * FROM data` over aliased columns; the
// engine injects the spatial machinery around it. These are the pure builders the
// UI (components/MapQueryPanel) and the runner (components/MapPreview) compose.

import type { Field } from '../metadata/types'

// The emitted GeoJSON column the map overlay reads (mirrors MapPreview).
export const GEOJSON_COL = 'geojson'

// The clean default the SQL editor opens with — ≤2 lines, no comments, no
// bbox/geometry plumbing (acceptance criterion). The table is always `data`.
export const DEFAULT_QUERY = 'SELECT * FROM data\nLIMIT 100'

export type Bounds = { minX: number; minY: number; maxX: number; maxY: number }

// One column of the logical `data` view: the human alias the user sees and types,
// the raw database column it maps to, its type, and (from the schema) an optional
// description. `isGeometry`/`isBbox` flag the two plumbing columns.
export type LogicalColumn = {
  alias: string
  raw: string
  type: string
  description?: string
  isGeometry?: boolean
  isBbox?: boolean
}

// One row of DuckDB's `DESCRIBE` output (the subset we read).
export type DescribeRow = { column_name: string; column_type: string }

// Quote a SQL identifier, escaping embedded double quotes. Aliases can contain
// spaces ("Property Type"), so every identifier the builders emit is quoted.
export function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`
}

// Single-quote a string literal for SQL (doubling embedded quotes).
function quoteLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`
}

// Whether a column type (DuckDB or Frictionless) is numeric — decides the operator
// menu and whether a filter value is emitted as a bare number or a quoted string.
export function isNumericType(type: string): boolean {
  return /^(bigint|hugeint|integer|smallint|tinyint|ubigint|uinteger|usmallint|utinyint|decimal|numeric|double|real|float|int|number)/i.test(
    type
  )
}

// Merge DuckDB's DESCRIBE (raw name + real type) with the Frictionless schema
// (human title + description) into the logical column list, and flag the geometry
// and covering-bbox columns so the runner can exclude/serialize them. Works with
// NO schema (aliases fall back to raw names, types come straight from DuckDB) — so
// the query surface is fully usable on a dataset that carries no field metadata.
export function deriveColumns(
  describe: DescribeRow[],
  fields?: Field[]
): { columns: LogicalColumn[]; geomCol?: string; bboxCol?: string } {
  const byName = new Map<string, Field>()
  for (const f of fields ?? []) byName.set(f.name, f)

  let geomCol: string | undefined
  let bboxCol: string | undefined
  const columns: LogicalColumn[] = describe.map((d) => {
    const type = d.column_type ?? ''
    const isGeometry = /geometry/i.test(type)
    // The covering bbox is a STRUCT named `bbox` (xmin/xmax/ymin/ymax).
    const isBbox = d.column_name.toLowerCase() === 'bbox' && /^struct/i.test(type)
    if (isGeometry) geomCol = d.column_name
    if (isBbox) bboxCol = d.column_name
    const field = byName.get(d.column_name)
    return {
      raw: d.column_name,
      // Prefer the Frictionless title as the alias; fall back to the raw name.
      alias: field?.title && field.title !== d.column_name ? field.title : d.column_name,
      type,
      description: field?.description,
      isGeometry,
      isBbox,
    }
  })
  return { columns, geomCol, bboxCol }
}

// The attribute columns (everything that isn't geometry or bbox) — what the user
// filters, charts, and sees in the table.
export function attributeColumns(columns: LogicalColumn[]): LogicalColumn[] {
  return columns.filter((c) => !c.isGeometry && !c.isBbox)
}

// The bbox row-group prune predicate for a viewport (cheap Parquet-stats filter).
function bboxPredicate(bboxCol: string, b: Bounds): string {
  const q = quoteIdent(bboxCol)
  return (
    `${q}.xmin <= ${b.maxX} AND ${q}.xmax >= ${b.minX} ` +
    `AND ${q}.ymin <= ${b.maxY} AND ${q}.ymax >= ${b.minY}`
  )
}

// Build the `data` VIEW definition: attribute columns aliased to their titles, the
// geometry/bbox columns kept raw (for the map wrapper), optionally CLIPPED to a
// viewport. The clip lives here — NOT in the user's SQL — so "limit to map view"
// never leaks a bbox predicate into the query a user reads (acceptance: default
// query has no bbox plumbing). bbox-first: prune on the covering bbox, then refine
// with the exact ST_Intersects on the survivors.
export function buildDataViewSql(
  columns: LogicalColumn[],
  geomCol: string | undefined,
  bboxCol: string | undefined,
  clip?: Bounds
): string {
  const selects: string[] = []
  for (const c of columns) {
    if (c.isGeometry || c.isBbox) {
      // Keep plumbing columns under their raw names.
      selects.push(quoteIdent(c.raw))
    } else if (c.alias === c.raw) {
      selects.push(quoteIdent(c.raw))
    } else {
      selects.push(`${quoteIdent(c.raw)} AS ${quoteIdent(c.alias)}`)
    }
  }
  let sql = `CREATE OR REPLACE VIEW data AS\nSELECT ${selects.join(', ')}\nFROM __source`
  if (clip && (bboxCol || geomCol)) {
    const preds: string[] = []
    if (bboxCol) preds.push(bboxPredicate(bboxCol, clip))
    if (geomCol) {
      preds.push(
        `ST_Intersects(${quoteIdent(geomCol)}, ` +
          `ST_MakeEnvelope(${clip.minX}, ${clip.minY}, ${clip.maxX}, ${clip.maxY}))`
      )
    }
    sql += `\nWHERE ${preds.join('\n  AND ')}`
  }
  return sql
}

// Wrap a user's logical query so the map gets geometry and the table doesn't: drop
// the plumbing columns from the projection and (when the result feeds the overlay)
// serialize the geometry to GeoJSON. Returns the wrapped SQL, or the query
// unchanged when the dataset has no geometry column. A projected/aggregate query
// that carries no geometry through will fail to bind against EXCLUDE — the runner
// catches that and falls back to the raw query (see MapPreview.runLogical).
export function wrapForMap(
  userSql: string,
  geomCol: string | undefined,
  bboxCol: string | undefined,
  includeGeojson: boolean
): string {
  if (!geomCol) return userSql
  const exclude = [geomCol, bboxCol].filter(Boolean).map((c) => quoteIdent(c as string))
  const geojson = includeGeojson
    ? `, ST_AsGeoJSON(${quoteIdent(geomCol)}) AS ${GEOJSON_COL}`
    : ''
  // Strip a trailing semicolon so the subquery stays valid.
  const inner = userSql.trim().replace(/;\s*$/, '')
  return `SELECT * EXCLUDE (${exclude.join(', ')})${geojson}\nFROM (\n${inner}\n)`
}

// --- Filter builder -------------------------------------------------------------

export type FilterOp =
  | '='
  | '≠'
  | '>'
  | '≥'
  | '<'
  | '≤'
  | 'contains'
  | 'starts with'
  | 'is empty'
  | 'is not empty'

export type Filter = { column: string; op: FilterOp; value: string }

// Operators offered for a column, by type. Text columns get substring matches;
// numeric columns get comparisons. Both get equality and empty checks.
const TEXT_OPS: FilterOp[] = ['=', '≠', 'contains', 'starts with', 'is empty', 'is not empty']
const NUM_OPS: FilterOp[] = ['=', '≠', '>', '≥', '<', '≤', 'is empty', 'is not empty']

export function operatorsForType(type: string): FilterOp[] {
  return isNumericType(type) ? NUM_OPS : TEXT_OPS
}

// Ops that take no value (a value input is hidden for these).
export function opTakesValue(op: FilterOp): boolean {
  return op !== 'is empty' && op !== 'is not empty'
}

// One filter chip → a SQL predicate against the aliased column. Numeric columns
// emit a bare number literal; everything else is a quoted string.
function filterPredicate(f: Filter, numeric: boolean): string {
  const col = quoteIdent(f.column)
  const lit = () => (numeric && f.value.trim() !== '' && !isNaN(Number(f.value)) ? f.value : quoteLiteral(f.value))
  switch (f.op) {
    case '=':
      return `${col} = ${lit()}`
    case '≠':
      return `${col} <> ${lit()}`
    case '>':
      return `${col} > ${lit()}`
    case '≥':
      return `${col} >= ${lit()}`
    case '<':
      return `${col} < ${lit()}`
    case '≤':
      return `${col} <= ${lit()}`
    case 'contains':
      return `CAST(${col} AS VARCHAR) ILIKE ${quoteLiteral('%' + f.value + '%')}`
    case 'starts with':
      return `CAST(${col} AS VARCHAR) ILIKE ${quoteLiteral(f.value + '%')}`
    case 'is empty':
      return `${col} IS NULL`
    case 'is not empty':
      return `${col} IS NOT NULL`
  }
}

// Generate the clean SQL a set of filter chips represents — `SELECT * FROM data
// [WHERE …] LIMIT n`. No bbox plumbing (the viewport clip is applied on the view,
// controlled by the separate "limit to map view" checkbox). This is exactly what
// "View as SQL" hands to the editor.
export function buildFilterSql(
  filters: Filter[],
  columns: LogicalColumn[],
  limit = 100
): string {
  const numericByAlias = new Map(columns.map((c) => [c.alias, isNumericType(c.type)]))
  const active = filters.filter((f) => f.column && (opTakesValue(f.op) ? f.value.trim() !== '' : true))
  const where = active.map((f) => filterPredicate(f, numericByAlias.get(f.column) ?? false))
  let sql = 'SELECT * FROM data'
  if (where.length) sql += `\nWHERE ${where.join('\n  AND ')}`
  sql += `\nLIMIT ${limit}`
  return sql
}

// --- Example queries ------------------------------------------------------------

export type ExampleQuery = { label: string; sql: string; limitToView?: boolean }

// Column that reads as categorical (good for a GROUP BY): a string column, first
// preferring an enum-ish name, then any string column.
function categoricalColumn(columns: LogicalColumn[]): LogicalColumn | undefined {
  const text = columns.filter((c) => !isNumericType(c.type) && !/geometry|struct|blob/i.test(c.type))
  return (
    text.find((c) => /type|categor|class|continent|region|status|group|kind|zone|use/i.test(c.alias)) ??
    text[0]
  )
}

// First numeric column — the value axis for a "top N" / chart example.
function numericColumn(columns: LogicalColumn[]): LogicalColumn | undefined {
  return columns.find((c) => isNumericType(c.type))
}

// Per-dataset example queries generated from the schema (acceptance §4b.3). Each
// is a ready-to-run clean query; "Features in current view" rides the viewport
// clip instead of a bbox predicate.
export function exampleQueries(columns: LogicalColumn[]): ExampleQuery[] {
  const attrs = attributeColumns(columns)
  const out: ExampleQuery[] = [
    { label: 'Features in current view', sql: DEFAULT_QUERY, limitToView: true },
  ]
  const cat = categoricalColumn(attrs)
  if (cat) {
    const c = quoteIdent(cat.alias)
    out.push({
      label: `Count by ${cat.alias}`,
      sql: `SELECT ${c}, count(*) AS n\nFROM data\nGROUP BY ${c}\nORDER BY n DESC`,
    })
  }
  const num = numericColumn(attrs)
  if (num) {
    const n = quoteIdent(num.alias)
    out.push({
      label: `Top 10 by ${num.alias}`,
      sql: `SELECT * FROM data\nORDER BY ${n} DESC\nLIMIT 10`,
    })
  }
  return out
}

// --- Human-readable errors ------------------------------------------------------

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost)
    }
  }
  return dp[m][n]
}

// Closest known aliases to an unknown column name (for "did you mean …").
function suggest(name: string, aliases: string[]): string[] {
  const threshold = Math.max(2, Math.ceil(name.length / 3))
  return aliases
    .map((a) => ({ a, d: levenshtein(name, a) }))
    .filter((x) => x.d <= threshold)
    .sort((x, y) => x.d - y.d)
    .slice(0, 3)
    .map((x) => x.a)
}

// Map a raw DuckDB-Wasm error to plain language (acceptance §4b.5). For an
// unknown column it NAMES the column and suggests the closest existing ones;
// otherwise it distills the common binder/parser/type errors and falls back to the
// original message so nothing is ever swallowed.
export function humanizeError(message: string, aliases: string[]): string {
  const msg = message || 'Query failed.'

  // Unknown column — the most common casual-user error.
  const col =
    /Referenced column "([^"]+)" not found/i.exec(msg) ??
    /column "([^"]+)" (?:not found|does not exist)/i.exec(msg) ??
    /Binder Error:.*?"([^"]+)"/i.exec(msg)
  if (/not found|does not exist/i.test(msg) && col) {
    const name = col[1]
    const hints = suggest(name, aliases)
    const tail = hints.length
      ? ` Did you mean ${hints.map((h) => `“${h}”`).join(', ')}?`
      : aliases.length
        ? ` Available columns: ${aliases.slice(0, 8).map((a) => `“${a}”`).join(', ')}${aliases.length > 8 ? ', …' : ''}.`
        : ''
    return `Unknown column “${name}”.${tail}`
  }

  // Unknown table — usually a typo for `data`.
  const tbl = /Table with name ([^ ]+) does not exist/i.exec(msg)
  if (tbl) return `Unknown table “${tbl[1]}”. The data is in a table called “data”.`

  // Type mismatch / conversion.
  if (/Conversion Error|Could not convert|Mismatch Type|type mismatch/i.test(msg)) {
    return `Type mismatch — a value doesn't match its column's type. Check that numbers aren't quoted and text values are. (${firstLine(msg)})`
  }

  // Unknown / mis-called function.
  if (/No function matches|Function .* does not exist|Scalar Function/i.test(msg)) {
    return `Unknown function or wrong argument types. ${firstLine(msg)}`
  }

  // Syntax.
  if (/Parser Error|syntax error/i.test(msg)) {
    return `SQL syntax error. ${firstLine(msg).replace(/^Parser Error:\s*/i, '')}`
  }

  return firstLine(msg)
}

function firstLine(msg: string): string {
  return msg.split('\n')[0].trim()
}
