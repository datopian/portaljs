// Sub-path hosting: build with BASE_PATH=/portal to serve the site at
// https://example.org/portal. Empty (the default) serves it at the root. This is
// the single source of truth — scripts/generate-dcat.ts reads it from here, and
// the client gets it as NEXT_PUBLIC_BASE_PATH (see lib/basePath.ts).
const basePath = (process.env.BASE_PATH || '').replace(/\/+$/, '')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
}
module.exports = nextConfig
