// PortalJS Arc — Router Worker (po-2xm).
// Bound to *.arc.portaljs.com. Resolves the hostname's <slug> to a tenant and serves
// their static build from R2 (sites/<slug>/…). Static-only; no SSR.
//
// R2 layout (slug-addressable so routing needs no DB on the hot path):
//   sites/<slug>/index.html, sites/<slug>/_next/static/…, sites/<slug>/data/…
// Ownership/quota live in D1 on the API side; the router serves by slug alone.

export interface Env {
  ASSETS: R2Bucket
}

// Labels under arc.portaljs.com that are never tenant portals.
const RESERVED = new Set(['www', 'api', 'admin', 'staging', 'arc', ''])

// The tenant slug is the left-most DNS label (`<slug>.arc.portaljs.com` or
// `<slug>.staging.arc.portaljs.com`). Reserved labels and the bare apex return null.
export function slugFromHost(hostname: string): string | null {
  const label = hostname.split('.')[0]?.toLowerCase() ?? ''
  if (RESERVED.has(label)) return null
  return label
}

// Candidate R2 keys for a request, in priority order. Directory/extensionless paths
// fall back to index.html (static-site convention).
export function resolveCandidates(slug: string, pathname: string): string[] {
  let p = decodeURIComponent(pathname)
  if (!p.startsWith('/')) p = '/' + p
  const base = `sites/${slug}`
  if (p.endsWith('/')) {
    // Directory index, plus the trimmed `<path>.html` — a default Next export stores
    // `/search` as `search.html`, so `/search/` must reach it too (not just index.html).
    const trimmed = p.slice(0, -1)
    const candidates = [`${base}${p}index.html`]
    if (trimmed) candidates.push(`${base}${trimmed}.html`)
    return candidates
  }
  const last = p.split('/').pop() ?? ''
  if (last.includes('.')) return [`${base}${p}`] // looks like a file
  // Extensionless: exact file, then Next static-export's `<path>.html` (the default,
  // no trailing slash), then a directory index (trailingSlash: true builds).
  return [`${base}${p}`, `${base}${p}.html`, `${base}${p}/index.html`]
}

const TYPES: Record<string, string> = {
  html: 'text/html; charset=utf-8',
  css: 'text/css; charset=utf-8',
  js: 'text/javascript; charset=utf-8',
  mjs: 'text/javascript; charset=utf-8',
  json: 'application/json; charset=utf-8',
  csv: 'text/csv; charset=utf-8',
  tsv: 'text/tab-separated-values; charset=utf-8',
  geojson: 'application/geo+json',
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  ico: 'image/x-icon',
  txt: 'text/plain; charset=utf-8',
  xml: 'application/xml',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  map: 'application/json',
  wasm: 'application/wasm',
}

export function contentType(key: string): string {
  const ext = key.includes('.') ? key.split('.').pop()!.toLowerCase() : ''
  return TYPES[ext] ?? 'application/octet-stream'
}

export function cacheControl(key: string): string {
  if (key.includes('/_next/static/')) return 'public, max-age=31536000, immutable'
  if (key.endsWith('.html')) return 'public, max-age=0, must-revalidate'
  return 'public, max-age=3600'
}

function serve(key: string, obj: R2ObjectBody, status = 200): Response {
  const headers = new Headers()
  headers.set('content-type', contentType(key))
  headers.set('cache-control', cacheControl(key))
  const etag = (obj as R2Object).httpEtag
  if (etag) headers.set('etag', etag)
  return new Response(obj.body, { status, headers })
}

function notFound(message: string): Response {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Not found</title></head>
<body style="font-family:system-ui,sans-serif;max-width:32rem;margin:6rem auto;text-align:center;color:#1f2937">
<h1 style="font-size:3rem;margin:0">404</h1>
<p style="color:#6b7280">${message}</p>
<p style="margin-top:2rem;font-size:.85rem;color:#9ca3af">PortalJS&nbsp;Arc</p>
</body></html>`
  return new Response(html, { status: 404, headers: { 'content-type': 'text/html; charset=utf-8' } })
}

async function route(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const slug = slugFromHost(url.hostname)
  if (!slug) return notFound('No portal at this address.')

  let candidates: string[]
  try {
    candidates = resolveCandidates(slug, url.pathname)
  } catch {
    // Malformed percent-encoding in the path (e.g. "/%") → 400, not an uncaught 500.
    return new Response('Bad Request', { status: 400, headers: { 'content-type': 'text/plain' } })
  }

  for (const key of candidates) {
    const obj = await env.ASSETS.get(key)
    if (obj) return serve(key, obj)
  }

  // Per-site custom 404, else the branded fallback.
  const custom = await env.ASSETS.get(`sites/${slug}/404.html`)
  if (custom) return serve(`sites/${slug}/404.html`, custom, 404)
  return notFound(`Portal "${slug}" not found.`)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405, headers: { allow: 'GET, HEAD' } })
    }
    const res = await route(request, env)
    // Workers don't auto-strip bodies for HEAD; do it explicitly (keep headers/status).
    if (request.method === 'HEAD') return new Response(null, { status: res.status, headers: res.headers })
    return res
  },
}
