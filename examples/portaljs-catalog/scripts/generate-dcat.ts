// Build-time generator for the DCAT harvest feeds.
//
// Reads the catalog through the data provider (the same seam the pages use), maps it
// to DCAT-3 JSON-LD (lib/metadata/dcat.ts), then emits one feed per configured
// application profile × serialization so national/EU/US portals can harvest it:
//
//   public/catalog.jsonld            — canonical feed (first profile, JSON-LD) — the
//                                      stable autodiscovery target in _document.tsx
//   public/catalog.<profile>.jsonld  — per-profile JSON-LD  (e.g. catalog.dcat-ap.jsonld)
//   public/catalog.<profile>.ttl     — per-profile Turtle
//   public/catalog.<profile>.rdf     — per-profile RDF/XML
//   public/catalog-feeds.json        — machine-readable index of the emitted feeds
//
// Because these are static files they harvest on ANY host (static Cloudflare Pages,
// a CDN, a Worker) with no runtime. Wired into `predev`/`prebuild` so they're fresh.
//
// Configuration: dcat.config.json in the portal root (see that file). Which profiles
// to emit, which serializations, and the catalog-level org/contact metadata the
// profiles require (publisher, contactPoint, themes). Env overrides: SITE_URL (the
// absolute site origin), DCAT_PROFILES (comma list, overrides config.profiles).
//
// Run: `tsx scripts/generate-dcat.ts` (invoked automatically by npm pre-scripts).

import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { provider } from '../lib/providers'
import {
  toDCATCatalog,
  getDcatProfile,
  serialize,
  validateDcat,
  type CatalogEntry,
  type DcatConfig,
  type RdfFormat,
  type JsonLdNode,
} from '../lib/metadata'

const OUT_DIR = join(process.cwd(), 'public')
const CONFIG_FILE = join(process.cwd(), 'dcat.config.json')

type DcatFileConfig = DcatConfig & {
  profiles?: string[]
  serializations?: RdfFormat[]
}

const EXT: Record<RdfFormat, string> = { jsonld: 'jsonld', ttl: 'ttl', rdf: 'rdf' }

async function loadConfig(): Promise<DcatFileConfig> {
  try {
    return JSON.parse(await readFile(CONFIG_FILE, 'utf8')) as DcatFileConfig
  } catch {
    return {} // no config → sensible defaults below
  }
}

async function main() {
  const cfg = await loadConfig()

  const profiles = (
    process.env.DCAT_PROFILES?.split(',').map((s) => s.trim()).filter(Boolean) ??
    cfg.profiles ??
    ['dcat-3']
  ).filter(Boolean)
  const serializations: RdfFormat[] = cfg.serializations?.length
    ? cfg.serializations
    : ['jsonld', 'ttl', 'rdf']

  const datasets = (await provider.listDatasets()) as CatalogEntry[]

  // Base DCAT-3 catalog (profile-agnostic). Profiles augment this.
  const base = toDCATCatalog(datasets, {
    baseUrl: process.env.SITE_URL,
    title: cfg.title ?? 'Data catalog',
    description: cfg.description ?? 'DCAT catalog of datasets in this portal.',
    // Reproducible when SOURCE_DATE_EPOCH is set, else now.
    modified: new Date(
      process.env.SOURCE_DATE_EPOCH ? Number(process.env.SOURCE_DATE_EPOCH) * 1000 : Date.now()
    ).toISOString(),
  })

  // Carry any per-dataset DCAT overrides from the manifest onto the base nodes by
  // position (listDatasets and toDCATCatalog preserve order), so a profile can read
  // a dataset's own publisher/contactPoint/themes/accessLevel. Optional — most
  // portals rely on the catalog-level config.
  const baseDatasets = (base['dcat:dataset'] ?? []) as JsonLdNode[]
  datasets.forEach((d, i) => {
    const ov = (d as { dcat?: unknown }).dcat
    if (ov && baseDatasets[i]) (baseDatasets[i] as { _dcat?: unknown })._dcat = ov
  })

  await mkdir(OUT_DIR, { recursive: true })

  const feeds: { profile: string; label: string; format: RdfFormat; path: string; conformsTo?: string }[] = []
  let canonicalWritten = false

  for (const profileId of profiles) {
    const profile = getDcatProfile(profileId)
    const catalog = profile.apply(base, cfg)

    // Report mandatory-field gaps (non-fatal — the build still emits the feed).
    const result = validateDcat(catalog, profile.id)
    if (result.errors.length) {
      console.warn(`⚠ DCAT ${profile.label}: ${result.errors.length} conformance error(s):`)
      for (const e of result.errors.slice(0, 10)) console.warn(`    - ${e.message}`)
      console.warn(`  Fix in dcat.config.json (publisher/contactPoint) — see /portaljs-add-dcat.`)
    }

    for (const format of serializations) {
      const body = serialize(catalog, format)
      const file = `catalog.${profile.id}.${EXT[format]}`
      await writeFile(join(OUT_DIR, file), body, 'utf8')
      feeds.push({
        profile: profile.id,
        label: profile.label,
        format,
        path: `/${file}`,
        conformsTo: profile.conformsTo,
      })

      // The FIRST profile's feeds also get canonical un-suffixed names — the stable
      // autodiscovery targets (catalog.jsonld has always been the harvest endpoint).
      if (!canonicalWritten) {
        await writeFile(join(OUT_DIR, `catalog.${EXT[format]}`), body, 'utf8')
      }
    }
    canonicalWritten = true
  }

  await writeFile(join(OUT_DIR, 'catalog-feeds.json'), JSON.stringify({ feeds }, null, 2) + '\n', 'utf8')

  console.log(
    `✓ DCAT feeds written: ${feeds.length} file(s) for ${profiles.length} profile(s) ` +
      `[${profiles.join(', ')}] × [${serializations.join(', ')}] over ${datasets.length} datasets`
  )
}

main().catch((err) => {
  console.error('Failed to generate DCAT feeds:', err)
  process.exit(1)
})
