import type { ReactNode } from 'react'

// The dark gradient panel the homepage closes on. The panel is shared and the
// actions are not: each page decides what its closing buttons do (the homepage's
// CtaBand, /government's book-a-call band).
export default function CtaBandShell({ children }: { children: ReactNode }) {
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
          <div className="relative z-10">{children}</div>
        </div>
      </div>
    </section>
  )
}
