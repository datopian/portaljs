// The metadata-profile contract — public surface.
//
// A dataset declares a Frictionless Table Schema + Data Package descriptor fields;
// a MetadataProfile names + validates that shape; the registry resolves a profile
// by id (default = the L0 Frictionless Tabular profile). DCAT interop is the
// serialization + harvest layer on top (toDCAT/toDCATCatalog → a /catalog.jsonld).
// See ./README.md.

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
  toDCATCatalog,
  fromDCATCatalog,
  DCAT_CONTEXT,
  type DcatDataset,
  type DcatDistribution,
  type DcatCatalog,
  type FrictionlessLike,
  type CatalogEntry,
  type ToDcatOptions,
  type ToDcatCatalogOptions,
} from './dcat'

// DCAT application profiles (DCAT-AP / DCAT-US / national) — the harvest layer.
export {
  getDcatProfile,
  registerDcatProfile,
  listDcatProfiles,
  makeNationalProfile,
  dcat2Profile,
  dcat3Profile,
  dcatApProfile,
  dcatUsProfile,
  dcatApSeProfile,
  dcatApChProfile,
  dcatApDeProfile,
  type DcatProfile,
  type DcatConfig,
  type DcatAgent,
  type DcatContact,
  type JsonLdNode,
  type ProfiledCatalog,
} from './dcat-profiles'

// RDF serializers for the feeds (Turtle + RDF/XML, alongside JSON-LD).
export { toTurtle, toRdfXml, serialize, type RdfFormat } from './dcat-rdf'

// Inbound harvest — read an external DCAT/DCAT-AP RDF feed (JSON-LD/Turtle/RDF-XML)
// back into canonical datasets (the two-way interop counterpart to dcat-rdf.ts).
export {
  harvest,
  harvestTriples,
  parseRdf,
  detectFormat,
  toCanonicalEntry,
  type RdfInputFormat,
  type HarvestOptions,
  type HarvestResult,
  type HarvestedDataset,
  type HarvestedResource,
  type Triple,
} from './dcat-harvest'

// Per-profile mandatory-field validation (the conformance gate).
export { validateDcat } from './dcat-validate'
