import Papa from 'papaparse'

export function parseCsv(csv: string) {
  const result = Papa.parse(csv.trim(), { header: true })
  return {
    rows: result.data as Record<string, string>[],
    fields: (result.meta.fields ?? []).map((f) => ({ key: f, name: f })),
  }
}
