// Round-trip proof for two-way DCAT interop: expose (dcat.ts + dcat-profiles.ts +
// dcat-rdf.ts) → RDF → consume back (dcat-harvest.ts) → canonical, for every profile
// × serialization. Asserts the fields both sides support survive with no loss.
//
// Run: npx tsx scripts/harvest-roundtrip.test.ts  (exits non-zero on any failure)

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  toDCAT,
  fromDCAT,
  toDCATCatalog,
  resolveResourceUrl,
  getDcatProfile,
  serialize,
  type CatalogEntry,
  type DcatConfig,
  type DcatDataset,
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

// The distributions a manifest entry should expose (#1669), computed independently of
// dcat.ts: `file` first, then one per resource; relative paths are served from
// <site>/data/, absolute URLs (remote Parquet/PMTiles/GeoParquet) are kept as-is, and
// a resource resolving to the file's URL is not listed twice.
function expectedDistributions(e: CatalogEntry): { url: string; format?: string }[] {
  const abs = (p: string) => (/^https?:\/\//.test(p) ? p : `${SITE}/data/${p}`)
  const out: { url: string; format?: string }[] = []
  if (e.file) out.push({ url: abs(e.file), format: e.format })
  for (const r of e.resources ?? [])
    if (!out.some((o) => o.url === abs(r.path))) out.push({ url: abs(r.path), format: r.format })
  return out
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
        // One distribution per file/resource — a multi-resource dataset must not fall
        // back to its landing page or collapse to one (#1669).
        const want = expectedDistributions(src)
        ok(
          got.resources.length === want.length,
          `${label}/${src.slug}: ${got.resources.length} distribution(s), want ${want.length}`,
        )
        ok(
          got.resources.every((r) => r.name !== 'landing page'),
          `${label}/${src.slug}: real distributions, not the landing-page fallback`,
        )
        for (const w of want)
          ok(
            got.resources.some((r) => r.path === w.url && r.format === w.format),
            `${label}/${src.slug}: distribution ${w.url} (${w.format}) recovered`,
          )
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

  // Multi-resource mapping (#1669): toDCAT emits one distribution per resource,
  // fromDCAT maps several distributions back to resources, single-file is unchanged.
  {
    // URL resolution mirrors the showcase's resourceUrl().
    ok(resolveResourceUrl('a.csv', SITE) === `${SITE}/data/a.csv`, 'resolveResourceUrl: bare filename → <site>/data/')
    ok(resolveResourceUrl('a.csv') === '/data/a.csv', 'resolveResourceUrl: no base → root-relative /data/')
    ok(resolveResourceUrl('/files/a.csv', SITE) === `${SITE}/files/a.csv`, 'resolveResourceUrl: site-root path → <site>/path')
    ok(resolveResourceUrl('https://x.org/a.parquet', SITE) === 'https://x.org/a.parquet', 'resolveResourceUrl: absolute URL as-is')
    ok(resolveResourceUrl('//x.org/a.parquet', SITE) === 'https://x.org/a.parquet', 'resolveResourceUrl: protocol-relative → base scheme')

    const byId = (id: string) =>
      (base['dcat:dataset'] as DcatDataset[]).find((d) => d['dct:identifier'] === id)!

    // Single-file datasets keep the exact distribution shape (and key order) they had.
    const cc = byId('reference/country-codes')
    ok(
      JSON.stringify(cc['dcat:distribution']) ===
        JSON.stringify([
          {
            '@type': 'dcat:Distribution',
            'dct:title': 'Country Codes',
            'dcat:downloadURL': `${SITE}/data/country-codes.csv`,
            'dcat:accessURL': `${SITE}/@reference/country-codes`,
            'dct:format': 'http://publications.europa.eu/resource/authority/file-type/CSV',
            'dcat:mediaType': 'http://www.iana.org/assignments/media-types/text/csv',
          },
        ]),
      `single-file distribution unchanged (got ${JSON.stringify(cc['dcat:distribution'])})`,
    )

    // A bundle gets one distribution per resource, with its own title/description.
    const ci = byId('reference/country-indicators')
    const ciDists = ci['dcat:distribution'] ?? []
    ok(ciDists.length === 3, `country-indicators: 3 distributions (got ${ciDists.length})`)
    ok(ciDists[1]?.['dct:title'] === 'Population 2022', 'bundle distribution titled from resource title')
    ok(ciDists[1]?.['dct:description'] === 'Estimated mid-year population.', 'bundle distribution carries resource description')
    ok(
      ciDists.every((d) => d['dcat:accessURL'] === `${SITE}/@reference/country-indicators`),
      'bundle distributions: accessURL = landing page (DCAT-AP mandatory)',
    )
    // Remote resources keep their absolute URL.
    const wb = byId('reference/world-boundaries')
    ok(
      (wb['dcat:distribution'] ?? []).map((d) => d['dct:format']?.split('/').pop()).join(',') === 'PMTILES,GEOPARQUET' &&
        (wb['dcat:distribution'] ?? []).every((d) => d['dcat:downloadURL']?.startsWith('https://data.portaljs.com/')),
      'world-boundaries: PMTiles + GeoParquet distributions at their remote URLs',
    )

    // file + resources: the file first, a resource at the same URL not repeated.
    const mixed = toDCAT(
      {
        name: 'Mixed',
        file: 'a.csv',
        format: 'csv',
        resources: [
          { name: 'a', path: 'a.csv', format: 'csv', title: 'A again' },
          { name: 'b', path: 'https://x.org/b.parquet', format: 'parquet', title: 'B' },
        ],
      },
      { baseUrl: SITE },
    )
    const md = mixed['dcat:distribution'] ?? []
    ok(
      md.length === 2 &&
        md[0]['dct:title'] === 'Mixed' &&
        md[0]['dcat:downloadURL'] === `${SITE}/data/a.csv` &&
        md[1]['dcat:downloadURL'] === 'https://x.org/b.parquet',
      `file + resources: file first, duplicate resource dropped (got ${JSON.stringify(md.map((d) => d['dcat:downloadURL']))})`,
    )
    ok(toDCAT({ name: 'Empty' })['dcat:distribution'] === undefined, 'no file, no resources → no dcat:distribution')

    // fromDCAT: one distribution → file/format (unchanged); several → resources.
    const one = fromDCAT(cc)
    ok(one.file === 'country-codes.csv' && one.format === 'csv' && one.resources === undefined, 'fromDCAT: single distribution → file/format')
    const many = fromDCAT(ci)
    ok(many.file === undefined && many.format === undefined, 'fromDCAT: several distributions → no single file')
    ok(
      many.resources?.length === 3 &&
        many.resources.every((r) => r.format === 'csv' && r.path.startsWith(`${SITE}/data/`)) &&
        many.resources.map((r) => r.name).join(',') === 'country-codes,population-2022,co2-emissions-per-capita',
      `fromDCAT: 3 resources with full URLs + unique names (got ${JSON.stringify(many.resources)})`,
    )
    ok(many.resources?.[0]?.description === 'ISO 3166-1 names with alpha-2 and alpha-3 codes.', 'fromDCAT: resource description recovered')
    // …and toDCAT re-emits the same distributions from them (no collapse on re-export).
    const again = toDCAT(many, { baseUrl: SITE, landingPage: `${SITE}/@reference/country-indicators` })
    ok(
      JSON.stringify(again['dcat:distribution']) === JSON.stringify(ciDists),
      'toDCAT(fromDCAT(x)) re-emits identical distributions for a bundle',
    )
  }

  // Croissant resolves bundle resources like the DCAT base: remote URLs as-is.
  {
    const cr = getDcatProfile('croissant').applyFromEntries!(datasets, base, CONFIG) as unknown as {
      dataset: { name: string; distribution?: { contentUrl: string }[] }[]
    }
    const rm = cr.dataset.find((d) => d.name === 'sales_region-metrics')
    const src = datasets.find((d) => d.slug === 'region-metrics')!.resources![0].path
    ok(rm?.distribution?.[0]?.contentUrl === src, `croissant: remote resource contentUrl as-is (got ${rm?.distribution?.[0]?.contentUrl})`)
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
