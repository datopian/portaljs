import manifest from '../datasets.json'

export type Dataset = {
  slug: string
  namespace: string
  name: string
  description?: string
  file: string
  format: 'csv' | 'tsv' | 'json' | 'geojson'
}

// The manifest is the single source of truth for the catalog. Add datasets by
// dropping the file in /public/data and appending an entry to datasets.json —
// no new page file needed (pages/[owner]/[slug].tsx renders every entry).
const datasets = manifest as Dataset[]

// A portal uses exactly ONE namespace mode. Set to 'theme' for a single-publisher
// portal (datasets grouped by subject) or 'owner' for a multi-publisher portal
// (datasets grouped by who published them). This only changes the showcase
// metadata label ("Theme" vs "Owner") — the URL is always /@<namespace>/<slug>.
export const NAMESPACE_TYPE: 'theme' | 'owner' = 'theme'

export function getDatasets(): Dataset[] {
  return datasets
}

export function getDataset(slug: string): Dataset | undefined {
  return datasets.find((d) => d.slug === slug)
}

// Resolve a dataset by its (namespace, slug) pair, which is unique across the
// manifest. Used by the showcase route to map /@<namespace>/<slug> back to data.
export function getDatasetByNamespace(
  namespace: string,
  slug: string
): Dataset | undefined {
  return datasets.find((d) => d.namespace === namespace && d.slug === slug)
}

// Canonical URL for a dataset's showcase page. Datasets are namespaced under `@`
// so they never collide with regular content/static pages (which never start
// with `@`). See README for the routing rationale.
export function datasetHref(d: Dataset): string {
  return `/@${d.namespace}/${d.slug}`
}
