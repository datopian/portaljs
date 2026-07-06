// Round-trip proof for two-way DCAT interop: expose (dcat.ts + dcat-profiles.ts +
// dcat-rdf.ts) → RDF → consume back (dcat-harvest.ts) → canonical, for every profile
// × serialization. Asserts the fields both sides support survive with no loss.
//
// Run: npx tsx scripts/harvest-roundtrip.test.ts  (exits non-zero on any failure)

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  toDCATCatalog,
  getDcatProfile,
  serialize,
  type CatalogEntry,
  type DcatConfig,
  type RdfFormat,
} from '../lib/metadata'
import { harvest, detectFormat, parseRdf } from '../lib/metadata/dcat-harvest'

let failures = 0
const ok = (cond: boolean, msg: string) => {
  if (!cond) {
    failures++
    console.error(`  ✗ ${msg}`)
  }
}

const SITE = 'https://data.example.org'
const CONFIG: DcatConfig = {
  title: 'Example catalog',
  description: 'Round-trip test catalog.',
  publisher: { name: 'Example Agency', homepage: 'https://agency.example.org' },
  contactPoint: { fn: 'Data Team', email: 'data@example.org' },
  license: 'https://creativecommons.org/licenses/by/4.0/',
  themes: ['http://publications.europa.eu/resource/authority/data-theme/GOVE'],
}

async function main() {
  const datasets = JSON.parse(
    await readFile(join(process.cwd(), 'datasets.json'), 'utf8'),
  ) as CatalogEntry[]
  const base = toDCATCatalog(datasets, {
    baseUrl: SITE,
    title: CONFIG.title,
    description: CONFIG.description,
    modified: '2026-07-06T00:00:00.000Z',
  })

  const profileIds = ['dcat-3', 'dcat-2', 'dcat-ap', 'dcat-us', 'dcat-ap-se', 'dcat-ap-de']
  const formats: RdfFormat[] = ['jsonld', 'ttl', 'rdf']

  for (const pid of profileIds) {
    const profile = getDcatProfile(pid)
    const catalog = profile.apply(base, CONFIG)
    for (const fmt of formats) {
      const body = serialize(catalog, fmt)
      const label = `${pid} × ${fmt}`

      // Format auto-detection must pick the serialization back out.
      ok(detectFormat(body) === fmt, `${label}: detectFormat → ${detectFormat(body)} (want ${fmt})`)

      const result = harvest(body, { format: fmt })
      ok(
        result.datasets.length === datasets.length,
        `${label}: harvested ${result.datasets.length}/${datasets.length} datasets`,
      )

      // Per-dataset fidelity: title, description, keywords, ≥1 resource with a URL.
      for (const src of datasets) {
        const got = result.datasets.find((d) => d.name === (src.title ?? src.name))
        if (!got) {
          ok(false, `${label}: missing dataset "${src.name}"`)
          continue
        }
        ok(got.description === src.description, `${label}/${src.slug}: description preserved`)
        for (const kw of src.keywords ?? [])
          ok(got.keywords?.includes(kw) ?? false, `${label}/${src.slug}: keyword "${kw}" preserved`)
        ok(got.resources.length >= 1, `${label}/${src.slug}: has ≥1 resource`)
        ok(
          got.resources.every((r) => /^https?:\/\//.test(r.path)),
          `${label}/${src.slug}: resource paths are absolute URLs`,
        )
        // The CSV distribution's format must round-trip via dct:format / mediaType.
        if (src.format)
          ok(
            got.resources.some((r) => r.format === src.format),
            `${label}/${src.slug}: format "${src.format}" recovered (got ${got.resources
              .map((r) => r.format)
              .join(',')})`,
          )
      }

      // Profile detection from dct:conformsTo (AP/US/national feeds).
      if (pid !== 'dcat-3' && pid !== 'dcat-2')
        ok(
          result.profiles.includes(pid) || result.profiles.some((p) => p.startsWith('dcat-ap')),
          `${label}: profile detected via conformsTo (got [${result.profiles}])`,
        )

      // Triple counts must be identical across serializations of the SAME catalog.
      const tripleCount = parseRdf(body, fmt).length
      ok(tripleCount > datasets.length, `${label}: produced ${tripleCount} triples`)
    }
  }

  // Cross-serialization triple-count equivalence per profile.
  for (const pid of profileIds) {
    const catalog = getDcatProfile(pid).apply(base, CONFIG)
    const counts = formats.map((f) => parseRdf(serialize(catalog, f), f).length)
    ok(
      counts.every((c) => c === counts[0]),
      `${pid}: triple counts agree across [jsonld,ttl,rdf] = [${counts}]`,
    )
  }

  console.log(
    failures === 0
      ? `\n✓ round-trip clean: ${profileIds.length} profiles × ${formats.length} serializations`
      : `\n✗ ${failures} assertion(s) failed`,
  )
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
