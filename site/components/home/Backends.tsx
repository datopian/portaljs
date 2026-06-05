// No backend logo assets ship with the repo, so we render styled wordmark
// chips. This reinforces the "decoupled, works with what you already run" idea.
const backends = [
  'CKAN',
  'DKAN',
  'OpenMetadata',
  'Microsoft Purview',
  'DataHub',
  'GitHub',
  'Frictionless',
]

export default function Backends() {
  return (
    <section id="backends" className="w-full scroll-mt-32 py-20 sm:py-[88px]">
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-12">
        <div className="max-w-[680px]">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            Integrations
          </span>
          <h2 className="mt-3.5 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Decoupled. Works with what you already have.
          </h2>
          <p className="mt-3.5 text-[17px] text-slate-600 dark:text-slate-300">
            Point PortalJS at your catalog or metadata system. Swap backends
            without rewriting your frontend.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {backends.map((name) => (
            <span
              key={name}
              className="rounded-[11px] border border-slate-200 bg-white px-5 py-[13px] font-mono text-sm font-semibold text-[#3b4a60] transition-colors duration-150 hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-800 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-blue-500/60 dark:hover:bg-slate-800 dark:hover:text-blue-300"
            >
              {name}
            </span>
          ))}
          <span className="rounded-[11px] border border-dashed border-slate-300 px-5 py-[13px] font-mono text-sm font-semibold text-slate-500 dark:border-slate-600 dark:text-slate-400">
            + custom backends
          </span>
        </div>
      </div>
    </section>
  )
}
