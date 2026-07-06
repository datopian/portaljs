// One-off validation harness (po-hqe): emit every DCAT profile × serialization from
// the REAL catalog with a fully-populated config, into a temp dir, for validation
// against official external validators (ITB SHACL / pyshacl). NOT wired into the
// build — run manually: `tsx scripts/validate-dcat-external.ts <outDir>`.

import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { provider } from '../lib/providers'
import {
  toDCATCatalog,
  getDcatProfile,
  serialize,
  validateDcat,
  listDcatProfiles,
  type CatalogEntry,
  type DcatConfig,
  type RdfFormat,
  type JsonLdNode,
} from '../lib/metadata'

const OUT = process.argv[2] || '/tmp/dcat-validation'
const EXT: Record<RdfFormat, string> = { jsonld: 'jsonld', ttl: 'ttl', rdf: 'rdf' }
const SER: RdfFormat[] = ['jsonld', 'ttl', 'rdf']

// A fully-populated catalog-level config — the state a Gov-tier portal SHOULD be in
// before claiming DCAT-AP conformance. EU data-theme URIs from the official vocab.
const CFG: DcatConfig = {
  title: 'PortalJS Reference Data Catalog',
  description: 'A catalog of reference datasets published via PortalJS, for DCAT harvest conformance testing.',
  publisher: { name: 'Datopian', homepage: 'https://www.datopian.com', type: 'foaf:Organization' },
  contactPoint: { fn: 'Datopian Data Team', email: 'info@datopian.com' },
  license: 'http://publications.europa.eu/resource/authority/licence/CC_BY_4_0',
  themes: ['http://publications.europa.eu/resource/authority/data-theme/GOVE'],
  languages: ['http://publications.europa.eu/resource/authority/language/ENG'],
  homepage: 'https://portaljs.com',
  accessLevel: 'public',
}

const SITE = 'https://catalog.example.org'

async function main() {
  const datasets = (await provider.listDatasets()) as CatalogEntry[]
  const base = toDCATCatalog(datasets, {
    baseUrl: SITE,
    title: CFG.title,
    description: CFG.description,
    modified: '2026-07-06T00:00:00.000Z',
  })

  await mkdir(OUT, { recursive: true })

  const profiles = listDcatProfiles()
  const manifest: {
    profile: string
    label: string
    conformsTo?: string
    files: Record<string, string>
    internalErrors: number
    internalWarnings: number
  }[] = []

  for (const p of profiles) {
    const profile = getDcatProfile(p.id)
    const catalog = profile.apply(structuredClone(base) as typeof base, CFG)
    const internal = validateDcat(catalog as JsonLdNode, profile.id)
    const files: Record<string, string> = {}
    for (const fmt of SER) {
      const body = serialize(catalog as JsonLdNode, fmt)
      const fn = `${profile.id}.${EXT[fmt]}`
      await writeFile(join(OUT, fn), body, 'utf8')
      files[fmt] = fn
    }
    manifest.push({
      profile: profile.id,
      label: profile.label,
      conformsTo: profile.conformsTo,
      files,
      internalErrors: internal.errors.length,
      internalWarnings: internal.warnings.length,
    })
    console.log(
      `${profile.id.padEnd(12)} internal: ${internal.errors.length} err ${internal.warnings.length} warn`
    )
  }

  await writeFile(join(OUT, 'manifest.json'), JSON.stringify({ site: SITE, count: datasets.length, profiles: manifest }, null, 2))
  console.log(`\n✓ Wrote ${profiles.length} profiles × ${SER.length} serializations to ${OUT}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
