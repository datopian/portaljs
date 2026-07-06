// Product-line disambiguation strip shown above the pricing tiers (po-xv5 §3).
// Canonical framing (matches po-7vq): PortalJS = OSS framework; Arc = the default managed
// layer; Cloud = a secondary managed CKAN backend you attach to Arc when a program needs it.
// Never present Cloud as "the product" here — the paid tiers are portal plans.

const lines = [
  {
    name: 'PortalJS',
    tag: 'open source',
    description: 'Own the code, host anywhere. Free forever.',
  },
  {
    name: 'PortalJS Arc',
    tag: 'default managed layer',
    description:
      'Zero-infra managed portals: AI-built, edge-served, in-browser querying. The default way to run PortalJS.',
    featured: true,
  },
  {
    name: 'PortalJS Cloud',
    tag: 'managed backend',
    description:
      'Managed CKAN backend for programs that need heavy cataloging infrastructure — attach it to any Arc portal.',
  },
]

export default function ProductLines() {
  return (
    <section className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-12 mt-14">
      <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
        One framework, two managed layers
      </h2>
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {lines.map((line) => (
          <div
            key={line.name}
            className={
              line.featured
                ? 'rounded-2xl bg-white dark:bg-slate-900 ring-2 ring-blue-500/40 dark:ring-blue-500/30 p-6'
                : 'rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 p-6'
            }
          >
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {line.name}
              </h3>
              <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 text-[11px] font-semibold rounded-full">
                {line.tag}
              </span>
            </div>
            <p className="mt-3 text-[15px] text-slate-600 dark:text-slate-300">
              {line.description}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-[15px] text-slate-600 dark:text-slate-300">
        Start on Arc. Attach a managed CKAN backend (Cloud) when your program
        needs one — same frontend, no rebuild.
      </p>
    </section>
  )
}
