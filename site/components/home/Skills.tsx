const skills = [
  { cmd: '/new-portal', desc: 'Scaffold a portal from a brief' },
  { cmd: '/add-dataset', desc: 'Add a CSV, TSV, JSON, or GeoJSON dataset' },
  { cmd: '/add-chart', desc: 'Drop in a line, bar, area, pie, or scatter chart' },
  { cmd: '/add-map', desc: 'Render GeoJSON on an interactive map' },
  { cmd: '/deploy', desc: 'One-shot deploy to Vercel or static hosting' },
]

export default function Skills() {
  return (
    <section className="w-full py-20 bg-slate-50 dark:bg-slate-900/40">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12 grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-500">
            Extensible
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Skills are first-class
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Every step of building a portal is a documented skill your assistant
            can run — and you can author your own. Skills are plain, versioned
            files in your repo, not a hidden platform.
          </p>
          <div className="mt-7 flex flex-wrap gap-4">
            <a
              href="https://github.com/datopian/portaljs/tree/main/.claude"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-500 hover:text-blue-400"
            >
              Browse the skills →
            </a>
            <a
              href="/opensource"
              className="font-semibold text-blue-500 hover:text-blue-400"
            >
              Read the docs →
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 font-mono text-sm">
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {skills.map((skill) => (
              <li
                key={skill.cmd}
                className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-3"
              >
                <code className="text-blue-600 dark:text-blue-300 whitespace-nowrap">
                  {skill.cmd}
                </code>
                <span className="text-slate-600 dark:text-slate-400">
                  {skill.desc}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
