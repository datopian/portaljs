import Papa from 'papaparse'

// Tolerant CSV parse. Real-world CSV exports often carry a `#` comment/metadata
// preamble, a BOM, or a few ragged rows — none of which should blank the whole
// table. We skip `#` comment lines and only throw when NOTHING parses; otherwise
// we render the valid rows and warn about the rest.
export function parseCsv(csv: string) {
  const result = Papa.parse(csv.trim(), {
    header: true,
    skipEmptyLines: true,
    comments: '#',
  })
  const rows = (result.data as Record<string, string>[]) ?? []
  const fields = (result.meta.fields ?? []).map((f) => ({ key: f, name: f }))
  // Throw only when NOTHING parsed (no header AND no rows). A header with zero
  // data rows still returns its fields, so the table renders columns + an empty
  // state rather than erroring.
  if (rows.length === 0 && fields.length === 0) {
    const msg = result.errors.map((e) => `row ${e.row ?? '?'}: ${e.message}`).join('; ')
    throw new Error(`CSV parse error — ${msg || 'no rows parsed'}`)
  }
  if (result.errors.length > 0 && typeof console !== 'undefined') {
    console.warn(
      `parseCsv: ${result.errors.length} non-fatal issue(s); rendering ${rows.length} rows.`
    )
  }
  return { rows, fields }
}
