// The portal's sub-path (`basePath` in next.config.js), or '' at the root.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

// Prefix a site-root path ("/catalog.jsonld") with the base path. next/link,
// next/router and next/image do this themselves; raw <link>/<a>/<img> hrefs and
// fetch() URLs do not, so route them through here. Absolute and protocol-relative
// URLs pass through unchanged.
export function withBasePath(path: string): string {
  return path.startsWith('/') && !path.startsWith('//') ? `${BASE_PATH}${path}` : path
}
