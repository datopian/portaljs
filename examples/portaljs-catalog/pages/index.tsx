import Head from 'next/head'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { getDatasets, type Dataset } from '../lib/datasets'

export async function getStaticProps() {
  return { props: { datasets: getDatasets() } }
}

export default function Home({ datasets }: { datasets: Dataset[] }) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return datasets
    return datasets.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.description ?? '').toLowerCase().includes(q)
    )
  }, [datasets, query])

  return (
    <>
      <Head>
        <title>__PROJECT_NAME__</title>
      </Head>
      <main className="max-w-5xl mx-auto px-4 py-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">__PROJECT_NAME__</h1>
          <p className="mt-3 text-lg text-gray-500">__DESCRIPTION__</p>
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
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${datasets.length} datasets...`}
              className="mb-6 w-full max-w-sm px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {filtered.length === 0 ? (
              <p className="text-gray-400">No datasets match “{query}”.</p>
            ) : (
              <div className="grid gap-4">
                {filtered.map((ds) => (
                  <Link
                    key={ds.slug}
                    href={`/datasets/${ds.slug}`}
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
