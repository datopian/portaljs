// Sub-path hosting: build with BASE_PATH=/portal to serve the site at
// https://example.org/portal. Empty (the default) serves it at the root. This is
// the single source of truth — scripts/generate-dcat.ts reads it from here, and
// the client gets it as NEXT_PUBLIC_BASE_PATH (see lib/basePath.ts).
const basePath = (process.env.BASE_PATH || '').replace(/\/+$/, '')

// This portal's UI language: the code of a registered locales/<code>.json (see
// lib/i18n.ts and locales/README.md). Committed here so every build and deploy
// uses it; NEXT_PUBLIC_LOCALE=<code> overrides it for a single build. One locale
// per build — Next's i18n routing does not work with a static export.
const DEFAULT_LOCALE = 'en'
const locale = process.env.NEXT_PUBLIC_LOCALE || DEFAULT_LOCALE

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath, NEXT_PUBLIC_LOCALE: locale },
}
module.exports = nextConfig
