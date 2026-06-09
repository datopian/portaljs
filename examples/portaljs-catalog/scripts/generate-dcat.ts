// Build-time generator for the DCAT harvest document.
//
// Reads the catalog through the data provider (the same seam the pages use) and
// writes public/catalog.jsonld — a DCAT-3 JSON-LD Catalog. Because it's a static
// file it harvests on ANY host (static Cloudflare Pages, a CDN, a Worker), with no
// runtime needed. Wired into `predev`/`prebuild` so it's always fresh.
//
// Set SITE_URL (e.g. https://portal.example.org) to emit absolute landing/download
// URLs; without it, links are root-relative (fine for same-origin harvest).
//
// Run: `tsx scripts/generate-dcat.ts` (invoked automatically by npm pre-scripts).

import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { provider } from '../lib/providers'
import { toDCATCatalog, type CatalogEntry } from '../lib/metadata'

const OUT_DIR = join(process.cwd(), 'public')
const OUT_FILE = join(OUT_DIR, 'catalog.jsonld')

async function main() {
  const datasets = (await provider.listDatasets()) as CatalogEntry[]
  const catalog = toDCATCatalog(datasets, {
    baseUrl: process.env.SITE_URL,
    title: 'Data catalog',
    description: 'DCAT-3 catalog of datasets in this portal.',
    // No argless Date here would be reproducible; stamp with SOURCE_DATE_EPOCH when
    // set (reproducible builds), else now.
    modified: new Date(
      process.env.SOURCE_DATE_EPOCH ? Number(process.env.SOURCE_DATE_EPOCH) * 1000 : Date.now()
    ).toISOString(),
  })

  await mkdir(OUT_DIR, { recursive: true })
  await writeFile(OUT_FILE, JSON.stringify(catalog, null, 2) + '\n', 'utf8')
  console.log(`✓ DCAT catalog written: public/catalog.jsonld (${datasets.length} datasets)`)
}

main().catch((err) => {
  console.error('Failed to generate DCAT catalog:', err)
  process.exit(1)
})
