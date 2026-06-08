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

  // Client-side full-text filter over the datasets the provider returned. A
  // provider whose capabilities.search is true would instead call
  // provider.search({ q, … }) server-side (full-text / faceted by namespace,
  // format, tags) — the static provider filters here in the browser.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return datasets
    return datasets.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.namespace.toLowerCase().includes(q) ||
        (d.description ?? '').toLowerCase().includes(q)
    )
  }, [datasets, query])

  return (
    <>
      <Head>
        <title>Search — __PROJECT_NAME__</title>
      </Head>
      <main className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-8">
          <nav className="mb-4 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-700">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span>Search</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900">Datasets</h1>
        </header>

        {datasets.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-200 p-12 text-center text-gray-400">
            <p className="text-lg font-medium">No datasets yet</p>
            <p className="mt-1 text-sm">
              Add an entry to <code className="bg-gray-100 px-1 rounded">datasets.json</code> and
              drop the file in <code className="bg-gray-100 px-1 rounded">public/data</code>.
            </p>
          </div>
        ) : (
          <>
            <DebouncedInput
              value={query}
              onChange={(v) => setQuery(String(v))}
              placeholder={`Search ${datasets.length} datasets...`}
              aria-label="Search datasets"
              className="mb-6 w-full max-w-sm px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {filtered.length === 0 ? (
              <p className="text-gray-400">No datasets match “{query}”.</p>
            ) : (
              <div className="grid gap-4">
                {filtered.map((ds) => (
                  <Link
                    key={`${ds.namespace}/${ds.slug}`}
                    href={datasetHref(ds)}
                    className="block rounded-lg border border-gray-200 p-6 hover:border-blue-400 hover:shadow-sm transition-all"
                  >
                    <h2 className="text-xl font-semibold text-gray-900">{ds.name}</h2>
                    {ds.description && (
                      <p className="mt-1 text-gray-500">{ds.description}</p>
                    )}
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
