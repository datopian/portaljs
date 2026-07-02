import type { ReactNode } from 'react'

// The three "the framework scales" pillars shipped in the AI-native rework:
// large-file storage (Git LFS → R2 via Giftless), in-browser query
// (DuckDB-Wasm over Parquet), and one-command managed hosting (PortalJS Arc).
// Card visual language mirrors ValueProps for a single, cohesive home page.
const pillars: {
  title: string
  body: string
  href: string
  cta: string
  icon: ReactNode
}[] = [
  {
    title: 'Scale your data',
    body: 'Large files version with Git LFS and stream to Cloudflare R2 via Giftless. Your repo stays light while datasets scale to gigabytes.',
    href: '/docs/guides/scaling-data',
    cta: 'Scaling data',
    icon: (
      <>
        <ellipse cx="12" cy="6" rx="8" ry="3" />
        <path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
        <path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
      </>
    ),
  },
  {
    title: 'Query in the browser',
    body: 'Convert to Parquet and the showcase reads it with DuckDB-Wasm — SQL over big files, fetching only the bytes a query touches. No server.',
    href: '/docs/guides/scaling-data',
    cta: 'In-browser query',
    icon: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18" />
        <path d="m7 13 2 2-2 2M12 17h4" />
      </>
    ),
  },
  {
    title: 'Deploy to Arc',
    body: 'Run /portaljs-deploy to publish a static export to PortalJS Arc — Datopian-managed hosting on Cloudflare — live at a <slug>.arc.portaljs.com URL.',
    href: '/docs/arc',
    cta: 'PortalJS Arc',
    icon: (
      <>
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" />
        <path d="M2 12h20M12 2c2.5 2.7 3.8 6.3 4 10-.2 3.7-1.5 7.3-4 10-2.5-2.7-3.8-6.3-4-10 .2-3.7 1.5-7.3 4-10Z" />
      </>
    ),
  },
]

export default function DataScale() {
  return (
    <section
      id="scale"
      className="w-full scroll-mt-32 border-y border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/40 sm:py-[88px]"
    >
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-12">
        <div className="max-w-[680px]">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            Scale &amp; deploy
          </span>
          <h2 className="mt-3.5 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            From a KB of CSV to multi-GB datasets.
          </h2>
          <p className="mt-3.5 text-[17px] text-slate-600 dark:text-slate-300">
            The same portal grows with your data — big files on object storage,
            queried in the browser, shipped with one command.
          </p>
        </div>

        <div className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-[3px] hover:border-slate-300 hover:shadow-[0_16px_36px_-20px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
            >
              <div className="mb-4 grid h-[42px] w-[42px] place-items-center rounded-[11px] bg-gradient-to-br from-sky-400/20 to-blue-600/15 text-blue-800 dark:text-blue-300">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-[22px] w-[22px]"
                  aria-hidden="true"
                >
                  {p.icon}
                </svg>
              </div>
              <h3 className="mb-[7px] text-[17.5px] font-semibold text-slate-900 dark:text-white">
                {p.title}
              </h3>
              <p className="text-[14.5px] text-slate-600 dark:text-slate-300">
                {p.body}
              </p>
              <a
                href={p.href}
                className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {p.cta} <span aria-hidden="true">→</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
