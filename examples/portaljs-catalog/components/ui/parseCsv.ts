import Papa from 'papaparse'

export function parseCsv(csv: string) {
  const result = Papa.parse(csv.trim(), { header: true, skipEmptyLines: true })
  if (result.errors.length > 0) {
    const msg = result.errors.map((e) => `row ${e.row ?? '?'}: ${e.message}`).join('; ')
    throw new Error(`CSV parse error — ${msg}`)
  }
  return {
    rows: result.data as Record<string, string>[],
    fields: (result.meta.fields ?? []).map((f) => ({ key: f, name: f })),
  }
}
