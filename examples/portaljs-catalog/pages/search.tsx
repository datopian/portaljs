import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import DebouncedInput from '../components/ui/DebouncedInput'
import { datasetHref, getResources, type Dataset } from '../lib/datasets'
import { provider } from '../lib/providers'

export async function getStaticProps() {
  return { props: { datasets: await provider.listDatasets() } }
}

// Formats that mean a dataset carries geometry — its thumbnail is a map
// snapshot (a genuine "what's inside" preview), so the card keeps it. A
// dataset without any of these renders a data-shape tile instead (see
// ShapeTile): thumbnails on tabular datasets are usually publisher logos,
// which add nothing the namespace tag doesn't already say.
const GEO_FORMATS = new Set(['pmtiles', 'geoparquet', 'geojson'])

function isGeo(d: Dataset): boolean {
  return getResources(d).some((r) => GEO_FORMATS.has(r.format))
}

// Uniform card length: descriptions in a harvested catalog vary from one line
// to whole paragraphs. Cut at a word boundary near `max` so every card reads
// the same height; the full text still lives on the dataset page.
function truncate(s: string, max = 150): string {
  if (s.length <= max) return s
  const cut = s.slice(0, max)
  const space = cut.lastIndexOf(' ')
  return cut.slice(0, space > 100 ? space : max).replace(/[,;:.]$/, '') + '…'
}

// Compact record count for the data-shape tile (3149 → "3.1k").
function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return String(n)
}

// Field names for the "what's inside" chips, from the dataset-level schema or
// the first resource that carries one.
function fieldNames(d: Dataset): string[] {
  const schema = d.schema ?? getResources(d).find((r) => r.schema)?.schema
  return (schema?.fields ?? []).map((f) => f.name)
}

// Catalog surface: a borderless search line over a faceted result list.
// Categories (and publishers, when the portal has more than one) live in a
// left sidebar as clickable filters with per-facet counts — filter without
// scrolling — and every card leads with a data preview: a map snapshot for
// geo datasets, a format + record-count shape tile for tabular ones.
export default function Search({ datasets }: { datasets: Dataset[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [activeCats, setActiveCats] = useState<Set<string>>(new Set())
  const [activeNs, setActiveNs] = useState<Set<string>>(new Set())

  // Initialize the query from ?q=… once the router is ready (the home page CTA
  // and suggested-query chips both navigate here with a ?q param).
  useEffect(() => {
    if (!router.isReady) return
    const q = router.query.q
    setQuery(typeof q === 'string' ? q : '')
  }, [router.isReady, router.query.q])

  // Client-side full-text filter over the datasets the provider returned. A
  // provider whose capabilities.search is true would instead call
  // provider.search({ q, … }) server-side (full-text / faceted by namespace,
  // format, tags) — the static provider filters here in the browser.
  const searched = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return datasets
    return datasets.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.namespace.toLowerCase().includes(q) ||
        (d.description ?? '').toLowerCase().includes(q) ||
        (d.category ?? '').toLowerCase().includes(q)
    )
  }, [datasets, query])

  const catOf = (d: Dataset) => d.category ?? 'Other'
  const matchesCats = (d: Dataset) => activeCats.size === 0 || activeCats.has(catOf(d))
  const matchesNs = (d: Dataset) => activeNs.size === 0 || activeNs.has(d.namespace)

  const filtered = useMemo(
    () => searched.filter((d) => matchesCats(d) && matchesNs(d)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searched, activeCats, activeNs]
  )

  // Facet options with counts. Each group's counts are taken over the list
  // filtered by the query AND the OTHER group (standard faceted counting), so
  // a selection never zeroes out its own alternatives. Categories only appear
  // when the catalog uses them; the publisher group only when there are
  // several namespaces to choose between.
  const catFacets = useMemo(() => {
    if (!datasets.some((d) => d.category)) return null
    const counts = new Map<string, number>()
    for (const d of searched.filter(matchesNs))
      counts.set(catOf(d), (counts.get(catOf(d)) ?? 0) + 1)
    return Array.from(counts.entries()).sort(([a], [b]) =>
      a === 'Other' ? 1 : b === 'Other' ? -1 : a.localeCompare(b)
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasets, searched, activeNs])

  const nsFacets = useMemo(() => {
    if (new Set(datasets.map((d) => d.namespace)).size < 2) return null
    const counts = new Map<string, number>()
    for (const d of searched.filter(matchesCats))
      counts.set(d.namespace, (counts.get(d.namespace) ?? 0) + 1)
    return Array.from(counts.entries()).sort(([a], [b]) => a.localeCompare(b))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasets, searched, activeCats])

  const toggle = (set: Set<string>, v: string, apply: (s: Set<string>) => void) => {
    const next = new Set(set)
    if (next.has(v)) next.delete(v)
    else next.add(v)
    apply(next)
  }

  const hasFacets = Boolean(catFacets || nsFacets)

  return (
    <>
      <Head>
        <title>Search — __PROJECT_NAME__</title>
      </Head>
      <main
        className={`mx-auto px-6 pb-24 sm:px-16 ${hasFacets ? 'max-w-[1100px]' : 'max-w-[720px]'}`}
      >
        <nav className="pt-7 font-sans text-[13px] font-medium text-ink/50">
          <Link href="/" className="text-inherit no-underline hover:text-accent">
            Home
          </Link>
          <span className="text-ink"> / Search</span>
        </nav>

        <div className="flex items-baseline gap-4 pb-6 pt-9">
          <h1 className="font-serif text-[42px] font-semibold text-ink">Datasets</h1>
          {datasets.length > 0 && (
            <span className="font-sans text-[13px] font-medium text-ink/50">
              {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
            </span>
          )}
        </div>

        {datasets.length === 0 ? (
          <div className="py-10 font-serif text-[17px] italic text-ink/55">
            No datasets yet — add an entry to{' '}
            <code className="font-mono not-italic">datasets.json</code> and drop the
            file in <code className="font-mono not-italic">public/data</code>.
          </div>
        ) : (
          <div className={hasFacets ? 'lg:grid lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-12' : ''}>
            {hasFacets && (
              <aside className="pt-4">
                {catFacets && (
                  <FacetGroup
                    title="Categories"
                    options={catFacets}
                    active={activeCats}
                    onToggle={(v) => toggle(activeCats, v, setActiveCats)}
                    onClear={() => setActiveCats(new Set())}
                  />
                )}
                {nsFacets && (
                  <FacetGroup
                    title="Publishers"
                    options={nsFacets}
                    active={activeNs}
                    onToggle={(v) => toggle(activeNs, v, setActiveNs)}
                    onClear={() => setActiveNs(new Set())}
                  />
                )}
              </aside>
            )}

            <div>
              <DebouncedInput
                value={query}
                onChange={(v) => setQuery(String(v))}
                placeholder="Search datasets…"
                aria-label="Search datasets"
                className="w-full border-0 border-b border-ink/30 bg-transparent pb-3.5 font-serif text-lg italic text-ink placeholder:text-ink/40 focus:border-accent focus:outline-none"
              />
              {filtered.length === 0 ? (
                <div className="py-10 font-serif text-[17px] italic text-ink/55">
                  No datasets found{query ? ` for “${query}”` : ' for the selected filters'}.
                </div>
              ) : (
                <div className="pt-2">
                  {filtered.map((ds) => (
                    <DatasetRow key={`${ds.namespace}/${ds.slug}`} ds={ds} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  )
}

// One facet group in the left sidebar: a small uppercase heading, then one
// button per option with its count. Selection is a toggle; several options can
// be active at once (OR within the group, AND across groups).
function FacetGroup({
  title,
  options,
  active,
  onToggle,
  onClear,
}: {
  title: string
  options: [string, number][]
  active: Set<string>
  onToggle: (value: string) => void
  onClear: () => void
}) {
  return (
    <section className="mb-8">
      <div className="mb-2.5 flex items-baseline justify-between">
        <h2 className="font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/45">
          {title}
        </h2>
        {active.size > 0 && (
          <button
            onClick={onClear}
            className="cursor-pointer border-0 bg-transparent p-0 font-sans text-[11px] font-medium text-accent hover:underline"
          >
            Clear
          </button>
        )}
      </div>
      <ul className="m-0 max-h-[19rem] list-none overflow-y-auto p-0 pr-1">
        {options.map(([value, count]) => {
          const on = active.has(value)
          return (
            <li key={value}>
              <button
                onClick={() => onToggle(value)}
                aria-pressed={on}
                className={`flex w-full cursor-pointer items-baseline justify-between gap-2 border-0 bg-transparent px-0 py-[5px] text-left font-sans text-[13px] leading-snug ${
                  on ? 'font-semibold text-accent' : 'font-normal text-ink/70 hover:text-ink'
                }`}
              >
                <span>{value}</span>
                <span className={`text-[11px] tabular-nums ${on ? 'text-accent/70' : 'text-ink/40'}`}>
                  {count}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

// The "what's inside" tile for a dataset without a map snapshot: primary
// format on top, compact record count under it. Replaces the publisher-logo
// thumbnail — the publisher is already the namespace tag, so the tile shows
// data shape instead. A geo dataset that lacks a snapshot gets a plain "geo"
// label rather than an implementation format name like "pmtiles".
function ShapeTile({ ds }: { ds: Dataset }) {
  const format = isGeo(ds) ? 'geo' : getResources(ds)[0]?.format
  return (
    <div className="flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center self-center border border-ink/[0.15] bg-cream-panel">
      {format && (
        <span className="font-sans text-[10px] font-bold uppercase tracking-[0.08em] text-accent">
          {format}
        </span>
      )}
      {typeof ds.recordCount === 'number' && (
        <span className="font-sans text-[11px] font-semibold tabular-nums text-ink/70">
          {compact(ds.recordCount)}
        </span>
      )}
    </div>
  )
}

// One catalog row: a data preview (map snapshot for geo, shape tile for
// tabular), name + truncated description, a record-count + field-chip meta
// line, and the namespace tag. No index number — results are filtered and
// re-ordered freely, so a position number would be meaningless.
function DatasetRow({ ds }: { ds: Dataset }) {
  const geo = isGeo(ds)
  const fields = fieldNames(ds)
  return (
    <Link
      href={datasetHref(ds)}
      className="flex items-baseline gap-5 border-b border-ink/[0.12] py-6 no-underline"
    >
      {geo && ds.thumbnail ? (
        // Plain <img>: the portal builds to a static export, so next/image has
        // no optimizer to run through — and the thumbnail is already tiny.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={ds.thumbnail}
          alt=""
          loading="lazy"
          className="h-14 w-14 flex-shrink-0 self-center border border-ink/[0.15] object-cover"
        />
      ) : (
        <ShapeTile ds={ds} />
      )}
      <div className="min-w-0 flex-1">
        <div className="mb-1 font-serif text-xl font-semibold text-ink">{ds.name}</div>
        {ds.description && (
          <div className="font-sans text-sm leading-normal text-ink/60">
            {truncate(ds.description)}
          </div>
        )}
        {(typeof ds.recordCount === 'number' || fields.length > 0) && (
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1 font-sans text-[11px] text-ink/45">
            {typeof ds.recordCount === 'number' && (
              <span className="font-medium tabular-nums">
                {ds.recordCount.toLocaleString('en-US')} {geo ? 'features' : 'records'}
              </span>
            )}
            {fields.slice(0, 3).map((f) => (
              <span
                key={f}
                className="border border-ink/[0.12] bg-cream-panel px-1.5 py-px font-mono text-[10px] text-ink/55"
              >
                {f}
              </span>
            ))}
            {fields.length > 3 && <span>+{fields.length - 3} more</span>}
          </div>
        )}
      </div>
      <div className="ml-auto whitespace-nowrap pt-1 font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/40">
        {ds.namespace}
      </div>
    </Link>
  )
}
