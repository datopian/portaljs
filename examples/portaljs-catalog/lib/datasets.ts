import manifest from '../datasets.json'

export type Dataset = {
  slug: string
  name: string
  description?: string
  file: string
  format: 'csv' | 'tsv' | 'json' | 'geojson'
}

// The manifest is the single source of truth for the catalog. Add datasets by
// dropping the file in /public/data and appending an entry to datasets.json —
// no new page file needed (pages/datasets/[slug].tsx renders every entry).
const datasets = manifest as Dataset[]

export function getDatasets(): Dataset[] {
  return datasets
}

export function getDataset(slug: string): Dataset | undefined {
  return datasets.find((d) => d.slug === slug)
}
