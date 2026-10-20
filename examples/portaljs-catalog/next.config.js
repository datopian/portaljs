// Sub-path hosting: build with BASE_PATH=/portal to serve the site at
// https://example.org/portal. Empty (the default) serves it at the root. This is
// the single source of truth — scripts/generate-dcat.ts reads it from here, and
// the client gets it as NEXT_PUBLIC_BASE_PATH (see lib/basePath.ts).
const basePath = (process.env.BASE_PATH || '').replace(/\/+$/, '')

// UI language, chosen at build time: NEXT_PUBLIC_LOCALE=it npm run build picks
// locales/it.json. Unset means English. One locale per build — Next's i18n routing
// does not work with a static export. See lib/i18n.ts and locales/README.md.
const locale = process.env.NEXT_PUBLIC_LOCALE || 'en'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath, NEXT_PUBLIC_LOCALE: locale },
}
module.exports = nextConfig
