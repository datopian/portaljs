import Link from 'next/link'

// Site navbar, rendered on every page via `_app.tsx`. Minimal and light to match
// the catalog template's Tailwind style.
//
// BRANDING IS A PLACEHOLDER — the logo (`/icon.svg`) and the name (`__PROJECT_NAME__`,
// substituted by /portaljs-new-portal) ship as PortalJS defaults. Swap `public/icon.svg`
// (and the other files in `public/`) for your own mark; change the name in your portal's
// metadata. A generated portal should not permanently wear the PortalJS logo.
export default function Navbar() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label="__PROJECT_NAME__ — home"
        >
          {/* Spin-on-hover: a ~0.6s rotate, disabled under prefers-reduced-motion
              via Tailwind's `motion-reduce:` variant (see acceptance criteria). */}
          <img
            src="/icon.svg"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 transition-transform duration-700 ease-in-out group-hover:rotate-[360deg] motion-reduce:transform-none motion-reduce:transition-none"
          />
          <span className="text-base font-semibold text-gray-900">
            __PROJECT_NAME__
          </span>
        </Link>
        <Link
          href="/search"
          className="text-sm font-medium text-gray-600 transition-colors hover:text-blue-600"
        >
          Search
        </Link>
      </nav>
    </header>
  )
}
