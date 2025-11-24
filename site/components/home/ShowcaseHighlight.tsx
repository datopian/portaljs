import Link from 'next/link'
import { dataPortals } from '@/components/Showcases'

type ShowcaseItem = (typeof dataPortals)[number]

const highlightOrder = [
  'City of Ann Arbor',
  'SSEN',
  'Open Data Nepal',
  'NIRD Research Data Archive',
  'Transport Data Commons',
  'Lincolnshire County Council',
]

let featuredPortals: ShowcaseItem[] = highlightOrder
  .map((title) => dataPortals.find((portal) => portal.title === title))
  .filter((portal): portal is ShowcaseItem => Boolean(portal))

if (featuredPortals.length === 0) {
  featuredPortals = dataPortals.slice(0, 6)
}

export function ShowcaseHighlight() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/40">
      <div className="max-w-8xl mx-auto px-4 sm:px-8 xl:px-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-500">
              PortalJS in action
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              The frontend of choice for modern data stack
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
              Data teams ship beautiful, fast data portals with PortalJS. Explore a few live deployments below.
            </p>
          </div>
          <Link
            href="/data-portals"
            className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-500"
          >
            View all examples
            <svg
              className="ml-2 h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredPortals.map((portal) => (
            <a
              key={portal.title}
              href={portal.href}
              target="_blank"
              rel="noreferrer"
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={portal.image}
                  alt={portal.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                <div className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                  {portal.subtitle}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">
                      {portal.title}
                    </p>
                  </div>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-300">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {portal.description}
                </p>
              </div>
            </a>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <Link
            href="/data-portals"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:-translate-y-0.5"
          >
            Explore all data portals
          </Link>
        </div>
      </div>
    </section>
  )
}
