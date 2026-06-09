// The metadata-profile contract — public surface.
//
// A dataset declares a Frictionless Table Schema + Data Package descriptor fields;
// a MetadataProfile names + validates that shape; the registry resolves a profile
// by id (default = the L0 Frictionless Tabular profile). DCAT interop is the
// serialization layer on top, designed-in here and built later. See ./README.md.

export type {
  FieldType,
  FieldConstraints,
  Field,
  TableSchema,
  License,
  Source,
  PackageMetadata,
  ValidationInput,
  ValidationIssue,
  ValidationResult,
  MetadataProfile,
} from './types'

export { frictionlessTabularProfile } from './frictionless-tabular'

export {
  DEFAULT_PROFILE_ID,
  getProfile,
  registerProfile,
  listProfiles,
} from './registry'

export {
  toDCAT,
  fromDCAT,
  type DcatDataset,
  type DcatDistribution,
  type FrictionlessLike,
} from './dcat'
