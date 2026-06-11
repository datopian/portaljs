import Image from 'next/image'
import Link from 'next/link'

const portals = [
  {
    title: 'City of Malmö',
    subtitle: 'Municipal open data portal',
    href: 'https://opendata.malmo.se/en',
    image: '/static/img/showcases/malmo-open-data.png',
  },
  {
    title: 'City of Ann Arbor',
    subtitle: 'Municipal data portal',
    href: 'https://data.a2gov.org/',
    image: '/static/img/showcases/ann-arbor.webp',
  },
  {
    title: 'Transport Data Commons',
    subtitle: 'Shared open-data infrastructure for transport',
    href: 'https://portal.transport-data.org/',
    image: '/static/img/showcases/2025-06-06-TDC/tdc-hero.png',
  },
  {
    title: 'Open Data Nepal',
    subtitle: 'National open data portal',
    href: 'https://opendatanepal.com/',
    image: '/static/img/showcases/open-data-nepal.webp',
  },
]

export default function Showcase() {
  return (
    <section
      id="examples"
      className="w-full scroll-mt-32 border-y border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/40 sm:py-[88px]"
    >
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-[680px]">
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
              In production
            </span>
            <h2 className="mt-3.5 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Real portals, built with PortalJS.
            </h2>
            <p className="mt-3.5 text-[17px] text-slate-600 dark:text-slate-300">
              From national open-data programs to city governments and research
              networks.
            </p>
          </div>
          <Link
            href="/data-portals"
            className="whitespace-nowrap font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            See all showcases →
          </Link>
        </div>

        <div className="mt-11 grid gap-[22px] sm:grid-cols-2">
          {portals.map((portal) => (
            <Link
              key={portal.href}
              href={portal.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_20px_44px_-24px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div className="relative aspect-[16/9] overflow-hidden border-b border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
                <Image
                  src={portal.image}
                  alt={`${portal.title} portal`}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover object-top transition-transform duration-[400ms] group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex items-center justify-between px-[18px] py-4">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  {portal.title}
                </h3>
                <span className="hidden text-right font-mono text-xs font-medium text-slate-400 dark:text-slate-500 sm:block">
                  {portal.subtitle}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
