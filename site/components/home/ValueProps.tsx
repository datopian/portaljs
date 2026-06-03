const props = [
  {
    icon: '🌱',
    title: 'Open source, MIT',
    body: 'No lock-in, no license traps. Fork it, ship it, own it.',
  },
  {
    icon: '🤖',
    title: 'AI-native',
    body: 'Skills do the assembly. Your assistant scaffolds pages, loads data, and wires up views.',
  },
  {
    icon: '🧩',
    title: 'Any backend',
    body: 'CKAN, DKAN, OpenMetadata, Microsoft Purview, DataHub, GitHub, Frictionless, or your own.',
  },
  {
    icon: '🎨',
    title: 'Bring your own stack',
    body: 'Adapt PortalJS to your frontend tooling and design system. Plain, editable code throughout.',
  },
  {
    icon: '👥',
    title: 'Community-driven',
    body: 'An active Discord and open discussions. Built in the open, used in production.',
  },
]

export default function ValueProps() {
  return (
    <section id="solutions" className="w-full py-20 scroll-mt-20">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-500">
            Why PortalJS
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Built to fit your stack, not replace it
          </h2>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {props.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/10"
            >
              <span className="text-3xl" aria-hidden="true">
                {p.icon}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                {p.title}
              </h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300 leading-relaxed">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
