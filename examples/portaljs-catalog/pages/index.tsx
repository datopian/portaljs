import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'

// Suggested searches surfaced as chips below the hero. These are starting points
// derived from the sample datasets' themes — swap them for your portal's topics.
const SUGGESTED_QUERIES = ['population', 'emissions', 'country codes', 'reference']

export default function Home() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const search = (q: string) => {
    const trimmed = q.trim()
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search')
  }

  return (
    <>
      <Head>
        <title>__PROJECT_NAME__</title>
      </Head>
      <main className="max-w-3xl mx-auto px-4 py-24">
        <header className="text-center">
          <h1 className="text-5xl font-bold text-gray-900">__PROJECT_NAME__</h1>
          <p className="mt-4 text-lg text-gray-500">__DESCRIPTION__</p>
        </header>

        {/* Search is the primary call to action — submitting navigates to /search. */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            search(query)
          }}
          className="mt-10"
          role="search"
        >
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search datasets..."
            aria-label="Search datasets"
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {SUGGESTED_QUERIES.map((q) => (
            <Link
              key={q}
              href={`/search?q=${encodeURIComponent(q)}`}
              className="rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              {q}
            </Link>
          ))}
        </div>

        <p className="mt-8 text-center text-sm">
          <Link href="/search" className="text-blue-600 hover:text-blue-700">
            Browse all datasets &rarr;
          </Link>
        </p>
      </main>
    </>
  )
}
