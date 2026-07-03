import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { suggestedQueries } from '../lib/datasets'
import { provider } from '../lib/providers'

// Popular searches are derived from the portal's own datasets at build time (see
// suggestedQueries) rather than hardcoded, so every portal surfaces its real
// topics without editing this file.
export async function getStaticProps() {
  return { props: { suggested: suggestedQueries(await provider.listDatasets()) } }
}

// Home surface (editorial design imported from the Claude Design mockups): an
// eyebrow, the portal name in Newsreader, a one-line description, and search as
// the primary call to action — an editorial input plus popular-search links that
// route into the /search catalog.
export default function Home({ suggested }: { suggested: string[] }) {
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
      <main className="mx-auto max-w-[660px] px-6 pb-24 pt-16 sm:px-16 sm:pt-[104px]">
        <div className="mb-6 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-accent">
          Open Data Portal
        </div>
        <h1 className="mb-7 font-serif text-[44px] font-semibold leading-[1.06] tracking-[-0.01em] text-ink sm:text-[62px]">
          __PROJECT_NAME__
        </h1>
        <p className="mb-11 max-w-[520px] font-serif text-xl leading-[1.55] text-ink/70">
          __DESCRIPTION__
        </p>

        {/* Search is the primary call to action — submitting navigates to /search. */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            search(query)
          }}
          role="search"
          className="mb-12"
        >
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search datasets…"
            aria-label="Search datasets"
            className="w-full border-0 border-b border-ink/30 bg-transparent pb-3.5 font-serif text-lg italic text-ink placeholder:text-ink/40 focus:border-accent focus:outline-none"
          />
        </form>

        {suggested.length > 0 && (
          <>
            <div className="mb-3.5 font-sans text-[11px] font-semibold uppercase tracking-[0.1em] text-ink/45">
              Popular searches
            </div>
            <div className="flex flex-wrap gap-x-[22px] gap-y-2">
              {suggested.map((q) => (
                <Link
                  key={q}
                  href={`/search?q=${encodeURIComponent(q)}`}
                  className="font-serif text-base font-medium italic text-accent underline decoration-1 underline-offset-[3px] hover:text-ink"
                >
                  {q}
                </Link>
              ))}
            </div>
          </>
        )}

        <div className="mt-12">
          <Link
            href="/search"
            className="border-b border-accent pb-[3px] font-serif text-[17px] font-medium italic text-ink no-underline hover:text-accent"
          >
            Browse all datasets &rarr;
          </Link>
        </div>
      </main>
    </>
  )
}
