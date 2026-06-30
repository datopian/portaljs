// PortalJS Arc — Deploy API Worker (po-bn9).
// POST /v1/deploy   — auth (Bearer token) → unpack a gzipped tar of `out/` →
//                     write to R2 sites/<slug>/… → record in D1 → return the URL.
// GET  /v1/deploy/:id — deployment status.
// GET  /healthz       — liveness.
//
// Served at api.arc.portaljs.com (api.staging.arc.portaljs.com on staging).

import { untar } from './untar'
import { userForToken, loginForToken, userRowForToken, ensureProject, getOwnedProject, recordDeployment, getDeployment } from './db'
import { mintLfsToken, normalizeActions, normalizeTtl, LFS_ORG } from './lfs'

export interface Env {
  ASSETS: R2Bucket
  DB: D1Database
  ARC_HOST: string // e.g. "staging.arc.portaljs.com"
  MAX_FILES?: string
  MAX_BYTES?: string
  // RS256 PKCS#8 PEM that signs Giftless LFS client tokens. Provisioned as a Worker
  // secret (NOT a [vars] entry) — see wrangler.toml. Absent ⇒ /v1/repos/:slug/lfs-token
  // returns 503. The matching public key is deployed on Giftless (GIFTLESS_JWT_PUBLIC_KEY).
  GIFTLESS_JWT_PRIVATE_KEY?: string
  // Giftless host the minted token targets (default lfs.portaljs.com).
  LFS_HOST?: string
}

const RESERVED = new Set(['www', 'api', 'admin', 'staging', 'arc'])

// Parse a numeric env var, falling back when unset or non-numeric (so a config typo
// can't silently disable a limit by making it NaN).
function intVar(v: string | undefined, fallback: number): number {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

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

  const maxFiles = intVar(env.MAX_FILES, 5000)
  const maxBytes = intVar(env.MAX_BYTES, 100 * 1024 * 1024)
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

// POST /v1/repos/:slug/lfs-token — mint a scoped RS256 Giftless LFS token for the
// authenticated Arc user. Guarded by the Arc API bearer token (device-flow
// PORTALJS_TOKEN); 401 otherwise. The slug must ALREADY exist and be owned by the
// caller (404 if it doesn't exist, 403 if another account owns it) — minting never
// claims a slug, so user A can't mint for user B's repo or squat an unclaimed one.
//   ?actions=write,verify → push token; DEFAULT is read-only (pull), least privilege
//   ?ttl=<seconds>        → lifetime, capped at 24h; default 3600
export async function handleLfsToken(request: Request, env: Env, slug: string): Promise<Response> {
  const auth = request.headers.get('authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  if (!token) return json({ error: 'missing bearer token' }, 401)
  const user = await userRowForToken(env.DB, token)
  if (!user) return json({ error: 'invalid token' }, 401)

  if (!validSlug(slug)) return json({ error: `invalid slug "${slug}"` }, 400)

  // The signer lives only as a Worker secret; fail loudly if it's not provisioned
  // (e.g. `wrangler secret put GIFTLESS_JWT_PRIVATE_KEY` not yet run) rather than 500.
  if (!env.GIFTLESS_JWT_PRIVATE_KEY) {
    return json({ error: 'LFS token issuer not configured (GIFTLESS_JWT_PRIVATE_KEY unset)' }, 503)
  }

  const url = new URL(request.url)
  const actions = normalizeActions(url.searchParams.get('actions'))
  if (actions === null) return json({ error: 'invalid actions (use a subset of read,write,verify)' }, 400)
  const ttl = normalizeTtl(Number(url.searchParams.get('ttl')) || undefined)

  // Ownership: the project must ALREADY exist and belong to the caller. Minting a
  // token must never create/claim a slug (po-g9y.13 security fix) — deploy the
  // portal first (/portaljs-deploy), the only path that allocates a slug.
  const project = await getOwnedProject(env.DB, user.id, slug)
  if (!project.ok) {
    return project.reason === 'not_found'
      ? json({ error: `repo "${slug}" not found — deploy it first to claim the slug` }, 404)
      : json({ error: `repo "${slug}" belongs to another account` }, 403)
  }

  let minted
  try {
    minted = await mintLfsToken(env.GIFTLESS_JWT_PRIVATE_KEY, {
      slug,
      actions,
      ttl,
      sub: `arc:${user.login}`,
    })
  } catch (e) {
    return json({ error: `could not mint token: ${(e as Error).message}` }, 500)
  }

  const host = env.LFS_HOST || 'lfs.portaljs.com'
  return json({
    token: minted.token,
    scope: minted.scope,
    expires_in: minted.expiresIn,
    // Credentialed LFS URL the client sets as `git config lfs.url` (local only).
    lfs_url: `https://_jwt:${minted.token}@${host}/${LFS_ORG}/${slug}`,
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
    // whoami — let the CLI/skill confirm a stored token and show "Logged in as @user".
    if (url.pathname === '/v1/whoami' && request.method === 'GET') {
      const auth = request.headers.get('authorization') ?? ''
      const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
      if (!token) return json({ error: 'missing bearer token' }, 401)
      const login = await loginForToken(env.DB, token)
      return login ? json({ login }) : json({ error: 'invalid token' }, 401)
    }
    if (url.pathname === '/v1/deploy' && request.method === 'POST') return handleDeploy(request, env)
    const lfsM = url.pathname.match(/^\/v1\/repos\/([a-z0-9-]+)\/lfs-token$/)
    if (lfsM && request.method === 'POST') return handleLfsToken(request, env, lfsM[1])
    const m = url.pathname.match(/^\/v1\/deploy\/([\w-]+)$/)
    if (m && request.method === 'GET') {
      const row = await getDeployment(env.DB, m[1])
      return row ? json(row) : json({ error: 'not found' }, 404)
    }
    return json({ error: 'not found' }, 404)
  },
}
