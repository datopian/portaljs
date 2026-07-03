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
        (d.description ?? '').toLowerCase().includes(q)
    )
  }, [numbered, query])

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
            ) : (
              <div className="pt-4">
                {filtered.map((ds) => (
                  <Link
                    key={`${ds.namespace}/${ds.slug}`}
                    href={datasetHref(ds)}
                    className="flex items-baseline gap-6 border-b border-ink/[0.12] py-7 no-underline"
                  >
                    <div className="w-9 flex-shrink-0 font-serif text-xl font-medium italic text-accent">
                      {ds.num}
                    </div>
                    <div className="max-w-[480px]">
                      <div className="mb-1.5 font-serif text-xl font-semibold text-ink">
                        {ds.name}
                      </div>
                      {ds.description && (
                        <div className="font-sans text-sm leading-normal text-ink/60">
                          {ds.description}
                        </div>
                      )}
                    </div>
                    <div className="ml-auto whitespace-nowrap pt-1 font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/40">
                      {ds.namespace}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </>
  )
}
