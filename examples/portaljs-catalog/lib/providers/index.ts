import { StaticProvider } from './static-provider'
import type { DataProvider } from './types'

export type {
  DataProvider,
  Dataset,
  DataFormat,
  Resource,
  DatasetQuery,
  ProviderCapabilities,
} from './types'

// Select the active data provider. The three surfaces consume the portal's data
// ONLY through this, so swapping the source never touches a page.
//
// Today there is one provider — StaticProvider, the git/static default that reads
// datasets.json. A backend provider (CKAN, OpenMetadata, or a git-LFS +
// object-store source) implements the same DataProvider interface and is selected
// here, typically driven by an env var, e.g.:
//
//   export function getProvider(): DataProvider {
//     if (process.env.CKAN_URL) return new CkanProvider(process.env.CKAN_URL)
//     return new StaticProvider()
//   }
//
// See ./README.md for the contract and a guide to adding one.
export function getProvider(): DataProvider {
  return new StaticProvider()
}

// The singleton the pages import.
export const provider: DataProvider = getProvider()
