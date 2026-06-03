// No backend logo assets ship with the repo, so we render styled wordmarks.
// This reinforces the "decoupled, works with what you already run" message.
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
    <section className="w-full py-20 bg-slate-50 dark:bg-slate-900/40">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-500">
          Decoupled by design
        </p>
        <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Works with the catalog you already run
        </h2>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          PortalJS is a frontend framework, not a database. Point it at your
          metadata system — or build your own adapter.
        </p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {backends.map((name) => (
            <span
              key={name}
              className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-5 py-2.5 font-mono text-base sm:text-lg font-medium text-slate-700 dark:text-slate-200 transition-colors hover:border-blue-400 hover:text-blue-500"
            >
              {name}
            </span>
          ))}
          <span className="px-3 py-2.5 text-base sm:text-lg italic text-slate-500 dark:text-slate-400">
            …and custom backends
          </span>
        </div>
      </div>
    </section>
  )
}
