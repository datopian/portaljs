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
  // Catalog-wide extent so GeoDCAT-AP emits dct:spatial to round-trip.
  spatial: { bbox: 'POLYGON((-180 -90, 180 -90, 180 90, -180 90, -180 -90))' },
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

  const profileIds = ['dcat-3', 'dcat-2', 'dcat-ap', 'dcat-us', 'geodcat-ap', 'dcat-ap-se', 'dcat-ap-de']
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

  // Conformance-shape guards (po-hqe — validated against the ITB DCAT-AP SHACL
  // validator + DCAT-US 3.0 SHACL). These properties MUST be IRIs, not literals, or
  // the feed fails a national/EU harvester's node-kind constraint.
  {
    const ap = getDcatProfile('dcat-ap').apply(base, CONFIG) as Record<string, unknown>
    const ctx = ap['@context'] as Record<string, unknown>
    ok(
      (ctx['dcat:downloadURL'] as { '@type'?: string })?.['@type'] === '@id',
      'context: dcat:downloadURL typed @id (JSON-LD links are IRIs, not literals)',
    )
    ok(
      (ctx['dct:modified'] as { '@type'?: string })?.['@type'] === 'xsd:dateTime',
      'context: dct:modified typed xsd:dateTime',
    )
    const ds = (ap['dcat:dataset'] as Record<string, unknown>[])[0]
    const dist = (ds['dcat:distribution'] as Record<string, unknown>[])[0]
    ok(
      /^https?:\/\//.test(dist['dct:format'] as string),
      `dct:format is an IRI (got ${dist['dct:format']})`,
    )
    ok(
      /^https?:\/\//.test(dist['dcat:mediaType'] as string),
      `dcat:mediaType is an IRI (got ${dist['dcat:mediaType']})`,
    )
    ok(
      typeof (ds['dct:publisher'] as Record<string, unknown>)?.['@id'] === 'string',
      'dct:publisher is IRI-identified (@id) — required by DCAT-US',
    )
  }

  // GeoDCAT-AP spatial coverage must survive the round-trip (dct:spatial → bbox).
  {
    const geo = getDcatProfile('geodcat-ap').apply(base, CONFIG)
    for (const fmt of formats) {
      const got = harvest(serialize(geo, fmt), { format: fmt })
      ok(
        got.datasets.every((d) => typeof d.spatial === 'string' && d.spatial.includes('POLYGON')),
        `geodcat-ap × ${fmt}: dct:spatial (bbox WKT) round-trips`,
      )
      ok(got.profiles.includes('geodcat-ap'), `geodcat-ap × ${fmt}: profile detected via conformsTo`)
    }
  }

  // Croissant (schema.org JSON-LD): build from the raw entries (recordSets need the
  // Table Schema DCAT drops), then harvest the schema.org Dataset nodes back.
  {
    const cr = getDcatProfile('croissant').applyFromEntries!(datasets, base, CONFIG)
    const body = serialize(cr, 'jsonld')
    const got = harvest(body, { format: 'jsonld' })
    ok(got.datasets.length === datasets.length, `croissant: harvested ${got.datasets.length}/${datasets.length} datasets`)
    ok(got.profiles.includes('croissant'), `croissant: profile detected (got [${got.profiles}])`)
    ok(
      got.datasets.every((d) => d.resources.length >= 1 && d.resources.every((r) => /^https?:\/\//.test(r.path))),
      'croissant: every dataset has ≥1 FileObject with an absolute contentUrl',
    )
    // The country-codes dataset carries a Table Schema → a recordSet with fields.
    const parsed = JSON.parse(body) as { dataset: Record<string, unknown>[] }
    const cc = parsed.dataset.find((d) => d.name === 'reference_country-codes')
    ok(Array.isArray(cc?.recordSet) && (cc!.recordSet as unknown[]).length >= 1, 'croissant: schema-bearing dataset emits a cr:RecordSet')
    ok(cc?.conformsTo === 'http://mlcommons.org/croissant/1.0', 'croissant: dataset stamps Croissant 1.0 conformsTo')
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
