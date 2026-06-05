import type { ReactNode } from 'react'

const props: { title: string; body: string; icon: ReactNode }[] = [
  {
    title: 'Open source, MIT',
    body: 'No lock-in, no license traps. Fork it, ship it, own it.',
    icon: (
      <>
        <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  },
  {
    title: 'AI-native',
    body: 'Skills do the assembly. Your assistant scaffolds pages, loads data, and wires up views.',
    icon: (
      <>
        <rect x="4" y="7" width="16" height="13" rx="2" />
        <path d="M12 7V4M8 3h8M9 13h0M15 13h0M9 17h6" />
      </>
    ),
  },
  {
    title: 'Any backend',
    body: 'CKAN, DKAN, OpenMetadata, Microsoft Purview, DataHub, GitHub, Frictionless, or your own.',
    icon: <path d="M4 7h7v4H4zM4 15h7v2H4zM13 9h7v8h-7z" />,
  },
  {
    title: 'Bring your own stack',
    body: 'Adapt PortalJS to your frontend tooling and design system. Plain, editable code throughout.',
    icon: (
      <>
        <path d="M3 9l9-6 9 6-9 6-9-6Z" />
        <path d="M3 9v6l9 6 9-6V9" />
      </>
    ),
  },
  {
    title: 'Community-driven',
    body: 'An active Discord and open discussions. Built in the open, used in production.',
    icon: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20a6 6 0 0 1 12 0M16 6a3 3 0 0 1 0 6M22 20a6 6 0 0 0-5-5.9" />
      </>
    ),
  },
]

export default function ValueProps() {
  return (
    <section
      id="why"
      className="w-full scroll-mt-32 border-y border-slate-200 bg-slate-50 py-20 dark:border-slate-800 dark:bg-slate-900/40 sm:py-[88px]"
    >
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-12">
        <div className="max-w-[680px]">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
            Why PortalJS
          </span>
          <h2 className="mt-3.5 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Built to fit your stack, not replace it.
          </h2>
          <p className="mt-3.5 text-[17px] text-slate-600 dark:text-slate-300">
            A decoupled framework: keep the catalog, metadata system and
            frontend tooling you already run.
          </p>
        </div>

        <div className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {props.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-[3px] hover:border-slate-300 hover:shadow-[0_16px_36px_-20px_rgba(15,23,42,0.28)] dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
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
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
