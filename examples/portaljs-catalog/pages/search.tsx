import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import DebouncedInput from '../components/ui/DebouncedInput'
import { datasetHref, type Dataset } from '../lib/datasets'
import { provider } from '../lib/providers'

export async function getStaticProps() {
  return { props: { datasets: await provider.listDatasets() } }
}

// Catalog surface (editorial design imported from the Claude Design mockups): a
// numbered index of datasets under a borderless search line. The number is a
// stable position in the full catalog, so it doesn't shuffle as the list filters.
export default function Search({ datasets }: { datasets: Dataset[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  // Initialize the query from ?q=… once the router is ready (the home page CTA
  // and suggested-query chips both navigate here with a ?q param).
  useEffect(() => {
    if (!router.isReady) return
    const q = router.query.q
    setQuery(typeof q === 'string' ? q : '')
  }, [router.isReady, router.query.q])

  // Assign each dataset its stable 1-based catalog position before filtering, so
  // a dataset keeps the same index number no matter what the search removes.
  const numbered = useMemo(
    () => datasets.map((d, i) => ({ ...d, num: String(i + 1).padStart(2, '0') })),
    [datasets]
  )

  // Client-side full-text filter over the datasets the provider returned. A
  // provider whose capabilities.search is true would instead call
  // provider.search({ q, … }) server-side (full-text / faceted by namespace,
  // format, tags) — the static provider filters here in the browser.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return numbered
    return numbered.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.namespace.toLowerCase().includes(q) ||
        (d.description ?? '').toLowerCase().includes(q) ||
        (d.category ?? '').toLowerCase().includes(q)
    )
  }, [numbered, query])

  // Group the filtered list under category headers when the catalog uses
  // categories at all (any dataset carries one). Categories sort A→Z with
  // "Other" (the uncategorized bucket) last; a catalog with no categories
  // renders the flat list unchanged.
  const grouped = useMemo(() => {
    if (!numbered.some((d) => d.category)) return null
    const buckets = new Map<string, typeof filtered>()
    for (const d of filtered) {
      const c = d.category ?? 'Other'
      const bucket = buckets.get(c)
      if (bucket) bucket.push(d)
      else buckets.set(c, [d])
    }
    return Array.from(buckets.entries()).sort(([a], [b]) =>
      a === 'Other' ? 1 : b === 'Other' ? -1 : a.localeCompare(b)
    )
  }, [numbered, filtered])

  return (
    <>
      <Head>
        <title>Search — __PROJECT_NAME__</title>
      </Head>
      <main className="mx-auto max-w-[720px] px-6 pb-24 sm:px-16">
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
          <>
            <DebouncedInput
              value={query}
              onChange={(v) => setQuery(String(v))}
              placeholder="Search datasets…"
              aria-label="Search datasets"
              className="w-full border-0 border-b border-ink/30 bg-transparent pb-3.5 font-serif text-lg italic text-ink placeholder:text-ink/40 focus:border-accent focus:outline-none"
            />
            {filtered.length === 0 ? (
              <div className="py-10 font-serif text-[17px] italic text-ink/55">
                No datasets found for “{query}”.
              </div>
            ) : grouped ? (
              <div className="pt-4">
                {grouped.map(([category, items]) => (
                  <section key={category}>
                    <h2 className="mb-1 mt-8 font-sans text-[12px] font-semibold uppercase tracking-[0.12em] text-accent first:mt-2">
                      {category}
                    </h2>
                    {items.map((ds) => (
                      <DatasetRow key={`${ds.namespace}/${ds.slug}`} ds={ds} />
                    ))}
                  </section>
                ))}
              </div>
            ) : (
              <div className="pt-4">
                {filtered.map((ds) => (
                  <DatasetRow key={`${ds.namespace}/${ds.slug}`} ds={ds} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  )
}

// One catalog row: stable index number, optional thumbnail, name + description,
// namespace tag. Shared by the grouped and flat renderings so they never drift.
function DatasetRow({ ds }: { ds: Dataset & { num: string } }) {
  return (
    <Link
      href={datasetHref(ds)}
      className="flex items-baseline gap-6 border-b border-ink/[0.12] py-7 no-underline"
    >
      <div className="w-9 flex-shrink-0 font-serif text-xl font-medium italic text-accent">
        {ds.num}
      </div>
      {ds.thumbnail && (
        // Plain <img>: the portal builds to a static export, so next/image has
        // no optimizer to run through — and the thumbnail is already tiny.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={ds.thumbnail}
          alt=""
          loading="lazy"
          className="h-14 w-14 flex-shrink-0 self-center border border-ink/[0.15] object-cover"
        />
      )}
      <div className="max-w-[480px]">
        <div className="mb-1.5 font-serif text-xl font-semibold text-ink">{ds.name}</div>
        {ds.description && (
          <div className="font-sans text-sm leading-normal text-ink/60">{ds.description}</div>
        )}
      </div>
      <div className="ml-auto whitespace-nowrap pt-1 font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/40">
        {ds.namespace}
      </div>
    </Link>
  )
}
