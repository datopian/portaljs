const skills = [
  { cmd: '/portaljs-new-portal', desc: 'Scaffold a portal from a brief' },
  { cmd: '/portaljs-add-dataset', desc: 'Add a CSV, TSV, JSON, or GeoJSON dataset' },
  { cmd: '/portaljs-add-chart', desc: 'Drop in a line, bar, area, pie, or scatter chart' },
  { cmd: '/portaljs-add-map', desc: 'Render GeoJSON on an interactive map' },
  { cmd: '/portaljs-deploy', desc: 'One-shot deploy to Vercel or static hosting' },
]

export default function Skills() {
  return (
    <section id="skills" className="w-full scroll-mt-32 py-20 sm:py-[88px]">
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-12">
        <div className="max-w-[680px]">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            Extensibility
          </span>
          <h2 className="mt-3.5 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Skills are first-class.
          </h2>
          <p className="mt-3.5 text-[17px] text-slate-600 dark:text-slate-300">
            Every capability is a documented skill — composable, inspectable,
            and yours to extend. Author your own and the assistant picks them up.
          </p>
        </div>

        <div className="mt-11 grid items-stretch gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* built-in skills */}
          <div className="rounded-2xl border border-slate-200 bg-white p-[30px] dark:border-slate-800 dark:bg-slate-900/60">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Built-in skills
            </h3>
            <div className="mt-[18px] flex flex-col gap-2.5">
              {skills.map((skill) => (
                <div
                  key={skill.cmd}
                  className="flex items-center gap-3 rounded-[9px] border border-slate-200 px-3.5 py-[11px] font-mono text-[13.5px] text-[#3b4a60] dark:border-slate-800 dark:text-slate-300"
                >
                  <span className="h-[7px] w-[7px] flex-none rounded-full bg-[#28c840]" />
                  <span className="text-blue-600 dark:text-blue-300">
                    {skill.cmd}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">·</span>
                  <span>{skill.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* write your own */}
          <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-white p-[30px] dark:border-slate-800 dark:bg-slate-900/60">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Write your own
            </h3>
            <p className="mt-2.5 text-[14.5px] text-slate-600 dark:text-slate-300">
              Skills are plain, documented, and version-controlled. Add a
              capability once — reuse it across every portal you build.
            </p>
            <div className="mt-6 flex flex-wrap gap-3.5">
              <a
                href="https://github.com/datopian/portaljs/blob/main/VISION.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Read the roadmap →
              </a>
              <a
                href="https://github.com/datopian/portaljs/blob/main/.claude/AUTHORING.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Authoring guide →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
