import GitHubIcon from '../icons/GitHubIcon'

export default function CtaBand() {
  return (
    <section className="w-full pb-[88px] pt-[30px]">
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1830] via-[#10254a] to-[#173a78] px-7 py-12 text-center sm:px-14 sm:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(50% 90% at 50% -10%,rgba(125,211,252,0.22),transparent 70%)',
            }}
          />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Build your data portal today.
            </h2>
            <p className="mx-auto mt-4 max-w-[48ch] text-[17px] text-[#b9c9e4]">
              Open source, AI-native, no lock-in. Describe it once — ship plain,
              editable code you fully own.
            </p>
            <div className="mt-[30px] flex flex-wrap justify-center gap-3.5">
              <a
                href="https://portaljs.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-br from-sky-400 to-blue-600 px-[18px] py-2.5 text-[14.5px] font-semibold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] transition-all duration-150 hover:-translate-y-px hover:shadow-[0_10px_28px_-8px_rgba(37,99,235,0.7)]"
              >
                Get started
              </a>
              <a
                href="https://github.com/datopian/portaljs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-[10px] border border-white/20 bg-white/[0.06] px-[18px] py-2.5 text-[14.5px] font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:bg-white/[0.12]"
              >
                <span className="h-4 w-4">
                  <GitHubIcon />
                </span>
                Star on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
