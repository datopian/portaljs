const steps = [
  {
    n: '01',
    title: 'Describe',
    command: '/new-portal',
    body: 'Tell your AI assistant the portal you want — the audience, the data, the look. Plain language, no boilerplate.',
  },
  {
    n: '02',
    title: 'Scaffold',
    command: '/add-dataset',
    body: 'Skills assemble a real Next.js project: pages, tables, charts, and maps wired to your data. The output is plain, editable code.',
  },
  {
    n: '03',
    title: 'Publish',
    command: '/deploy',
    body: 'Ship a fast static site or connect a live backend. Own every file — there is no magic runtime to lock you in.',
  },
]

export default function AgentWorkflow() {
  return (
    <section className="w-full py-20">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-500">
            How it works
          </p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Describe → Scaffold → Publish
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            Three steps from an idea to a live portal. Each one is a documented
            skill your AI assistant runs for you.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.n}
              className="relative flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/10"
            >
              <span className="text-5xl font-bold text-slate-200 dark:text-slate-700">
                {step.n}
              </span>
              <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">
                {step.title}
              </h3>
              <code className="mt-2 inline-block w-fit rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 font-mono text-sm text-blue-600 dark:text-blue-300">
                {step.command}
              </code>
              <p className="mt-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
