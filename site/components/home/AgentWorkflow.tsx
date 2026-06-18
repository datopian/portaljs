const steps = [
  {
    n: '01',
    title: 'Describe',
    body: 'Tell your AI assistant the portal you want — the audience, the data, the look. Plain language, no boilerplate.',
    code: { cmd: '/portaljs-new-portal', rest: ' "Auckland Council open data portal"' },
  },
  {
    n: '02',
    title: 'Scaffold',
    body: 'Skills assemble a real Next.js project: pages, tables, charts, and maps wired to your data. The output is plain, editable code.',
    code: { cmd: '/portaljs-add-dataset', rest: ' ./data/air-quality.csv' },
  },
  {
    n: '03',
    title: 'Publish',
    body: 'Ship a fast static site or connect a live backend. Own every file — there is no magic runtime to lock you in.',
    code: { cmd: '/portaljs-deploy', rest: ' → auckland.portaljs.app' },
  },
]

export default function AgentWorkflow() {
  return (
    <section id="how" className="w-full scroll-mt-32 py-20 sm:py-[88px]">
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-12">
        <div className="max-w-[680px]">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            How it works
          </span>
          <h2 className="mt-3.5 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Describe → Scaffold → Publish
          </h2>
          <p className="mt-3.5 text-[17px] text-slate-600 dark:text-slate-300">
            Three steps from an idea to a live portal — skills do the assembly,
            and the output is plain, editable code.
          </p>
        </div>

        <div className="mt-11 grid gap-[22px] md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.n}
              className="relative rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60"
            >
              <span className="font-mono text-xs font-semibold tracking-[0.12em] text-blue-600 dark:text-blue-400">
                {step.n}
              </span>
              <h3 className="mb-2 mt-3.5 text-lg font-semibold text-slate-900 dark:text-white">
                {step.title}
              </h3>
              <p className="text-[14.5px] text-slate-600 dark:text-slate-300">
                {step.body}
              </p>
              <div className="mt-4 overflow-x-auto rounded-[9px] bg-[#0a1424] px-[13px] py-[11px] font-mono text-[12.5px] font-medium leading-[1.5] text-[#cdd9ec]">
                <span className="text-[#5eead4]">{step.code.cmd}</span>
                {step.code.rest}
              </div>
              {i < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute right-[-17px] top-1/2 z-10 hidden -translate-y-1/2 text-xl text-slate-300 dark:text-slate-600 md:block"
                >
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
