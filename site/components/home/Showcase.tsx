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
    image: '/static/img/showcases/2025-06-06-TDC/featured-image.jpg',
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
    <section className="w-full py-20">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-500">
              In production
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Real portals, built with PortalJS
            </h2>
          </div>
          <Link
            href="/data-portals"
            className="text-blue-500 font-semibold hover:text-blue-400 whitespace-nowrap"
          >
            See all showcases →
          </Link>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {portals.map((portal) => (
            <Link
              key={portal.href}
              href={portal.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/60 hover:shadow-xl hover:shadow-blue-500/10"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
                <Image
                  src={portal.image}
                  alt={`${portal.title} portal`}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {portal.title}
                </h3>
                <p className="mt-1 text-slate-600 dark:text-slate-300">
                  {portal.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
