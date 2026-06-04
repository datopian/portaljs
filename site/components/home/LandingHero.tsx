import AgentFlow from './AgentFlow'

export default function LandingHero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden scroll-mt-32"
    >
      {/* soft radial glows behind the hero */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 hidden dark:block"
        style={{
          background:
            'radial-gradient(60% 50% at 78% 18%,rgba(56,189,248,0.10),transparent 70%),radial-gradient(50% 60% at 10% 0%,rgba(37,99,235,0.10),transparent 65%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 dark:hidden"
        style={{
          background:
            'radial-gradient(60% 50% at 78% 18%,rgba(56,189,248,0.16),transparent 70%),radial-gradient(50% 60% at 10% 0%,rgba(37,99,235,0.10),transparent 65%)',
        }}
      />

      <div className="grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.02fr_1.1fr] lg:gap-14">
        {/* left: message + CTAs */}
        <div className="text-center lg:text-left">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Open source
          </span>

          <h1 className="mt-4 text-4xl font-bold leading-[1.08] tracking-tight text-slate-900 dark:text-white sm:text-5xl xl:text-6xl">
            The{' '}
            <span className="bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent">
              AI-native
            </span>{' '}
            framework for data portals.
          </h1>

          <p className="mx-auto mt-5 max-w-[34ch] text-lg text-slate-600 sm:text-xl lg:mx-0">
            Describe the portal you want — your AI assistant scaffolds it and
            loads your data. Open source, no lock-in.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3.5 lg:justify-start">
            <a
              href="https://portaljs.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              title="Get started with the open-source framework"
              className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-br from-sky-400 to-blue-600 px-[18px] py-2.5 text-[14.5px] font-semibold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] transition-all duration-150 hover:-translate-y-px hover:shadow-[0_10px_28px_-8px_rgba(37,99,235,0.7)]"
            >
              Get started
            </a>
            <a
              href="https://cloud.portaljs.com"
              target="_blank"
              rel="noopener noreferrer"
              title="PortalJS Cloud — fully managed hosting"
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-slate-300 bg-white px-[18px] py-2.5 text-[14.5px] font-semibold text-slate-700 transition-all duration-150 hover:-translate-y-px hover:border-blue-400 hover:text-blue-600"
            >
              PortalJS Cloud
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <p className="mx-auto mt-3.5 max-w-[42ch] text-sm text-slate-500 lg:mx-0">
            Self-host the open-source framework, or skip the setup with{' '}
            <span className="font-medium text-slate-700">PortalJS Cloud</span> —
            fully managed.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-4 text-[13.5px] text-slate-500 dark:text-slate-400 lg:justify-start">
            <span>
              <b className="font-semibold text-slate-900 dark:text-white">MIT</b>{' '}
              licensed
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span>
              <b className="font-semibold text-slate-900 dark:text-white">7+</b>{' '}
              backends
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span>
              <b className="font-semibold text-slate-900 dark:text-white">
                Plain
              </b>
              , editable code
            </span>
          </div>
        </div>

        {/* right: the hero terminal animation */}
        <div className="w-full">
          <AgentFlow />
        </div>
      </div>
    </section>
  )
}
