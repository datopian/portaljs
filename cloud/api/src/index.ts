// PortalJS Arc — Deploy API Worker (po-bn9).
// POST /v1/deploy   — auth (Bearer token) → unpack a gzipped tar of `out/` →
//                     write to R2 sites/<slug>/… → record in D1 → return the URL.
// GET  /v1/deploy/:id — deployment status.
// GET  /healthz       — liveness.
//
// Served at api.arc.portaljs.com (api.staging.arc.portaljs.com on staging).

import { untar } from './untar'
import { userForToken, ensureProject, recordDeployment, getDeployment } from './db'

export interface Env {
  ASSETS: R2Bucket
  DB: D1Database
  ARC_HOST: string // e.g. "staging.arc.portaljs.com"
  MAX_FILES?: string
  MAX_BYTES?: string
}

const RESERVED = new Set(['www', 'api', 'admin', 'staging', 'arc'])

// DNS-label slug: lowercase alphanumeric + hyphens, not reserved.
export function validSlug(slug: string): boolean {
  if (!slug || slug.length > 63 || RESERVED.has(slug)) return false
  return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(slug)
}

// Reject anything that could escape sites/<slug>/.
export function safeEntryName(name: string): boolean {
  if (!name || name.startsWith('/') || name.includes('\0')) return false
  return !name.split('/').some((seg) => seg === '..')
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' },
  })
}

async function gunzip(body: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  const stream = body.pipeThrough(new DecompressionStream('gzip'))
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
    total += value.length
  }
  const out = new Uint8Array(total)
  let off = 0
  for (const c of chunks) {
    out.set(c, off)
    off += c.length
  }
  return out
}

export async function handleDeploy(request: Request, env: Env): Promise<Response> {
  // Auth.
  const auth = request.headers.get('authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  if (!token) return json({ error: 'missing bearer token' }, 401)
  const userId = await userForToken(env.DB, token)
  if (!userId) return json({ error: 'invalid token' }, 401)

  // Slug.
  const slug = new URL(request.url).searchParams.get('slug')?.toLowerCase() ?? ''
  if (!validSlug(slug)) return json({ error: `invalid slug "${slug}"` }, 400)

  // Project ownership.
  const project = await ensureProject(env.DB, userId, slug)
  if (!project.ok) return json({ error: `slug "${slug}" is taken by another account` }, 409)

  if (!request.body) return json({ error: 'empty body (expected gzipped tar)' }, 400)

  // Unpack.
  let entries
  try {
    entries = untar(await gunzip(request.body))
  } catch (e) {
    return json({ error: `could not read upload (expected .tar.gz): ${(e as Error).message}` }, 400)
  }

  const maxFiles = Number(env.MAX_FILES ?? 5000)
  const maxBytes = Number(env.MAX_BYTES ?? 100 * 1024 * 1024)
  const files = entries.filter((e) => safeEntryName(e.name) && e.data.length >= 0)
  const bytes = files.reduce((n, f) => n + f.data.length, 0)
  if (files.length === 0) return json({ error: 'no files in upload' }, 400)
  if (files.length > maxFiles) return json({ error: `too many files (${files.length} > ${maxFiles})` }, 413)
  if (bytes > maxBytes) return json({ error: `upload too large (${bytes} > ${maxBytes} bytes)` }, 413)

  // Write to R2 under the slug prefix.
  const prefix = `sites/${slug}/`
  await Promise.all(files.map((f) => env.ASSETS.put(prefix + f.name, f.data)))

  const deploymentId = await recordDeployment(env.DB, project.projectId, 'ready', files.length, bytes)
  return json({
    url: `https://${slug}.${env.ARC_HOST}`,
    deployment_id: deploymentId,
    status: 'ready',
    files: files.length,
    bytes,
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'GET, POST, OPTIONS',
          'access-control-allow-headers': 'authorization, content-type',
        },
      })
    }
    if (url.pathname === '/healthz') return json({ ok: true })
    if (url.pathname === '/v1/deploy' && request.method === 'POST') return handleDeploy(request, env)
    const m = url.pathname.match(/^\/v1\/deploy\/([\w-]+)$/)
    if (m && request.method === 'GET') {
      const row = await getDeployment(env.DB, m[1])
      return row ? json(row) : json({ error: 'not found' }, 404)
    }
    return json({ error: 'not found' }, 404)
  },
}
