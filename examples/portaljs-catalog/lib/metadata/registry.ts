// The profile registry (L3 seam).
//
// L0 ships one built profile — the Frictionless Tabular Data Package — registered
// as the default. The L0→L3 ladder (see ./README.md):
//
//   L0  use the default profile as-is.
//   L1  extend L0 with a few extra fields (compose a profile in user code).
//   L2  a fully custom profile (your own schema + validate()).
//   L3  THIS registry: hold a profile per dataset type and resolve by id, so a
//       portal mixes profiles (e.g. one per domain) and surfaces pick the right
//       one off the dataset's `profile` field.
//
// L1/L2 are documented as how-to in the README; the registry is what makes L3 work
// and is what surfaces/skills call.

import { frictionlessTabularProfile } from './frictionless-tabular'
import type { MetadataProfile } from './types'

export const DEFAULT_PROFILE_ID = frictionlessTabularProfile.id

const registry = new Map<string, MetadataProfile>([
  [frictionlessTabularProfile.id, frictionlessTabularProfile],
])

// Register (or replace) a profile by its id. Call at module load so a dataset's
// `profile` field can resolve to it.
export function registerProfile(profile: MetadataProfile): void {
  registry.set(profile.id, profile)
}

// Resolve a profile by id, falling back to the L0 default when the id is absent or
// unknown. Surfaces call this with a dataset's `profile` field.
export function getProfile(id?: string): MetadataProfile {
  if (id) {
    const found = registry.get(id)
    if (found) return found
  }
  return frictionlessTabularProfile
}

// All registered profiles (e.g. for a settings/admin surface).
export function listProfiles(): MetadataProfile[] {
  return Array.from(registry.values())
}
