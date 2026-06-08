import manifest from '../../datasets.json'
import type {
  DataProvider,
  Dataset,
  DatasetQuery,
  ProviderCapabilities,
} from './types'

// The default provider: a read-only, build-time source backed by datasets.json
// (the git/static tier). The manifest is the single source of truth — add
// datasets by dropping the file in /public/data and appending an entry, no page
// file needed. A git-LFS + object-store (e.g. R2) source is the same model with
// the bytes living outside the repo; it would implement this same interface.
const datasets = manifest as Dataset[]

export class StaticProvider implements DataProvider {
  readonly name = 'static'

  readonly capabilities: ProviderCapabilities = {
    search: false, // the catalog page filters client-side over listDatasets()
    query: false, // flat-file preview only (no DuckDB / datastore yet)
    write: false, // datasets are added via git (a PR), not at runtime
    rbac: false, // fully public
  }

  async listDatasets(): Promise<Dataset[]> {
    return datasets
  }

  async getDataset(namespace: string, slug: string): Promise<Dataset | null> {
    return (
      datasets.find((d) => d.namespace === namespace && d.slug === slug) ?? null
    )
  }

  async search({ q, namespace, format }: DatasetQuery): Promise<Dataset[]> {
    const needle = q?.trim().toLowerCase()
    return datasets.filter((d) => {
      if (namespace && d.namespace !== namespace) return false
      if (format && d.format !== format) return false
      if (!needle) return true
      return (
        d.name.toLowerCase().includes(needle) ||
        d.namespace.toLowerCase().includes(needle) ||
        (d.description ?? '').toLowerCase().includes(needle)
      )
    })
  }
}
