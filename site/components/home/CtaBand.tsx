import Link from 'next/link'
import { track } from '@/lib/track'

// The homepage's closing CTA — the last thing a visitor who read the whole page
// sees. Its primary button MUST lead somewhere a visitor converts (po-80u).
//
// It used to read "Build your data portal today." above a "Get started" button
// that opened https://portaljs.com/docs in a NEW TAB. So the one slot on the page
// aimed at a reader who had finished deciding sent them to documentation, and the
// only two /build entry points on the whole homepage were the hero (above the
// fold) and the navbar button (hidden below `lg`). Measured 2026-07-01..08-10:
// 4.4% of homepage sessions reached /build, while /docs took 32 onward clicks and
// /pricing 43 against /build's 38.
//
// da-55j.6: the primary action is now a call, because PortalJS's buyers are
// governments and they book calls rather than sign up. The government landing page is
// the secondary action. Self-serve building stays reachable as the tertiary link for
// developers.
const BOOK_CALL = '/book-a-demo?source=home_cta_band'
const GOVERNMENT = '/government'
const BUILD_ROUTE = '/build'

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
              Running a public data portal?
            </h2>
            <p className="mx-auto mt-4 max-w-[48ch] text-[17px] text-[#b9c9e4]">
              Book a call and we’ll show you a prototype of your portal on your
              own data. Open source, no lock-in.
            </p>
            <div className="mt-[30px] flex flex-wrap justify-center gap-3.5">
              <Link
                href={BOOK_CALL}
                onClick={() => track('home_cta_band_clicked', { target: 'book_call' })}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-br from-sky-400 to-blue-600 px-[18px] py-2.5 text-[14.5px] font-semibold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] transition-all duration-150 hover:-translate-y-px hover:shadow-[0_10px_28px_-8px_rgba(37,99,235,0.7)]"
              >
                Book a call
                <span aria-hidden="true" className="text-[15px] leading-none">
                  →
                </span>
              </Link>
              <Link
                href={GOVERNMENT}
                onClick={() => track('home_cta_band_clicked', { target: 'government' })}
                className="inline-flex items-center gap-2 rounded-[10px] border border-white/20 bg-white/[0.06] px-[18px] py-2.5 text-[14.5px] font-semibold text-white transition-all duration-150 hover:-translate-y-px hover:bg-white/[0.12]"
              >
                PortalJS for government
              </Link>
            </div>
            {/* Self-serve stays reachable for developers, as the tertiary path. */}
            <Link
              href={BUILD_ROUTE}
              onClick={() => track('home_cta_band_clicked', { target: 'build' })}
              className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-medium text-[#9fb6da] transition-colors duration-150 hover:text-white"
            >
              Or build one yourself
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
