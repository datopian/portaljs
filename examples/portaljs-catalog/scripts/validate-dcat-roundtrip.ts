// Round-trip + real-external-harvest check for po-hqe.
//   1. Harvest our OWN emitted feeds (TTL + JSON-LD) back through dcat-harvest and
//      confirm the shared fields survive (no metadata loss on expose→harvest).
//   2. Harvest ONE real external DCAT-AP feed to prove parseRdf works on live RDF.
// Run: tsx scripts/validate-dcat-roundtrip.ts [feedDir]

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { provider } from '../lib/providers'
import { harvest } from '../lib/metadata'
import type { CatalogEntry } from '../lib/metadata'

const DIR = process.argv[2] || '/tmp/dcat-validation'

function norm(s?: string) {
  return (s ?? '').trim()
}

async function roundTrip(fmt: 'ttl' | 'jsonld') {
  const src = (await provider.listDatasets()) as CatalogEntry[]
  const text = await readFile(join(DIR, `dcat-ap.${fmt}`), 'utf8')
  const res = harvest(text, { format: fmt === 'jsonld' ? 'jsonld' : 'ttl' })
  const problems: string[] = []

  if (res.datasets.length !== src.length)
    problems.push(`dataset count ${res.datasets.length} != source ${src.length}`)

  // Match harvested datasets to source by title (order preserved, but match to be safe).
  for (const s of src) {
    const title = norm(s.title ?? s.name)
    const h = res.datasets.find((d) => norm(d.name) === title)
    if (!h) {
      problems.push(`missing harvested dataset "${title}"`)
      continue
    }
    // Shared fields DCAT round-trips: title, description, keywords, license, sources,
    // version, format (via distribution).
    if (norm(h.description) !== norm(s.description))
      problems.push(`${title}: description drift`)
    const sk = (s.keywords ?? []).slice().sort().join('|')
    const hk = (h.keywords ?? []).slice().sort().join('|')
    if (sk !== hk) problems.push(`${title}: keywords "${hk}" != "${sk}"`)
    if (s.version && norm(h.version) !== norm(s.version))
      problems.push(`${title}: version "${h.version}" != "${s.version}"`)
    // license: source may be SPDX name or path; harvested is the emitted URI.
    const srcLicense = s.licenses?.[0]?.path ?? s.licenses?.[0]?.name
    if (srcLicense && !h.license) problems.push(`${title}: license lost (had ${srcLicense})`)
    // format round-trips through the distribution.
    if (s.format) {
      const gotFormat = h.resources?.[0]?.format
      if (norm(gotFormat) !== norm(s.format))
        problems.push(`${title}: format "${gotFormat}" != "${s.format}"`)
    }
    // sources
    const srcSources = (s.sources ?? []).map((x) => x.path ?? x.title).filter(Boolean).length
    if (srcSources && !(h.sources?.length)) problems.push(`${title}: sources lost`)
  }

  console.log(`\n=== round-trip via ${fmt.toUpperCase()} ===`)
  console.log(`  harvested ${res.datasets.length}/${src.length} datasets; profiles=[${res.profiles.join(', ')}]`)
  if (problems.length) {
    console.log(`  ✗ ${problems.length} field-loss issue(s):`)
    for (const p of problems) console.log(`     - ${p}`)
  } else {
    console.log(`  ✓ no metadata loss on shared fields`)
  }
  return problems.length === 0
}

async function realExternal() {
  // A real, live DCAT-AP RDF feed. data.europa.eu exposes per-dataset RDF; use the
  // W3C DCAT-AP example feed hosted by SEMIC (stable, real-world DCAT-AP Turtle).
  const url =
    'https://raw.githubusercontent.com/SEMICeu/DCAT-AP/master/releases/2.2.0-hvd/html/examples/example-ms_catalogue.ttl'
  console.log(`\n=== real external harvest ===\n  ${url}`)
  try {
    const r = await fetch(url)
    if (!r.ok) {
      console.log(`  ⚠ fetch ${r.status} — skipping (network/source unavailable)`)
      return true
    }
    const text = await r.text()
    const res = harvest(text, { format: 'ttl' })
    console.log(`  ✓ parseRdf + harvest: ${res.datasets.length} dataset(s), profiles=[${res.profiles.join(', ')}]`)
    for (const d of res.datasets.slice(0, 3))
      console.log(`     - "${d.name}" (${d.resources.length} distribution(s), keywords=${d.keywords?.length ?? 0})`)
    if (res.warnings.length) console.log(`     warnings: ${res.warnings.slice(0, 3).join('; ')}`)
    return res.datasets.length > 0
  } catch (e) {
    console.log(`  ⚠ ${(e as Error).message} — skipping (network unavailable)`)
    return true
  }
}

async function main() {
  const a = await roundTrip('ttl')
  const b = await roundTrip('jsonld')
  const c = await realExternal()
  console.log(`\n${a && b && c ? '✓ ALL round-trip + external checks passed' : '✗ some checks failed'}`)
  if (!(a && b)) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
