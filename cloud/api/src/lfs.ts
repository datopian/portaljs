// Mint RS256 Giftless LFS client tokens — the Arc-side issuer half of the Giftless
// auth model (po-g9y.13). Giftless verifies tokens (and signs its own verify
// callbacks) but does NOT mint the client tokens git-lfs presents; an authenticated
// issuer must. This is that issuer, hosted on arc-api so no one distributes the
// raw RS256 private key.
//
// Mirrors giftless/mint-token.py's RS256 path EXACTLY in claim shape:
//   header  {"alg":"RS256","typ":"JWT","kid":"<key id>"}
//   payload {sub, iss, iat, nbf, exp, scopes:["obj:datopian/<slug>/*:<actions>"]}
// signed with RSASSA-PKCS1-v1_5 over SHA-256 (== Python's PKCS1v15 + SHA256).
//
// Signs with the GIFTLESS_JWT_PRIVATE_KEY Worker secret (a PKCS#8 PEM, the format
// giftless/scripts/gen-rs256-keys.sh writes) via Web Crypto — no `jose` dependency,
// matching db.ts's dependency-free style. The matching public key is deployed on
// Giftless as GIFTLESS_JWT_PUBLIC_KEY, so it verifies these tokens out of the box.

// LFS namespace (org). Fixed to match /portaljs-add-dataset and giftless/README:
// the Giftless object key is lfs/datopian/<slug>/<oid>.
export const LFS_ORG = 'datopian'

// git-lfs scope actions Giftless understands. A minted scope is a subset of these.
// The "*" wildcard is NOT accepted — a caller must name the actions it needs — and
// anything outside the set is rejected, so a caller can't inject arbitrary scope text.
const VALID_ACTIONS = new Set(['read', 'write', 'verify'])
// Least privilege (po-g9y.13): default to read-only (pull). Write/verify must be
// requested explicitly (e.g. the push side of /portaljs-add-dataset).
const DEFAULT_ACTIONS = 'read'
const DEFAULT_TTL = 3600
const MAX_TTL = 86400 // cap so a mis-set ttl can't mint a long-lived token

// JWT key id (header `kid`) + issuer (`iss`). Giftless enforces `kid` when its
// key_id is configured (giftless.yaml) — that is what lets us rotate the signing
// key (mint under a new kid, trust both during the overlap).
// NOTE: `aud` is intentionally NOT set. giftless 1.7.1's verifier calls
// jwt.decode() WITHOUT audience=, and PyJWT 1.7.1 raises InvalidAudienceError on
// ANY token carrying an aud claim (including giftless's own verify callbacks), so
// an aud claim would break auth. Adding it needs a giftless patch (pass audience=
// to decode) or a PyJWT upgrade — tracked as a follow-up.
const KEY_ID = 'giftless-rs256-1'
const ISSUER = 'arc.portaljs.com'

const enc = new TextEncoder()

function b64url(bytes: Uint8Array): string {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlJson(obj: unknown): string {
  // Compact separators (no spaces) — matches Python's json.dumps(separators=(",",":")).
  return b64url(enc.encode(JSON.stringify(obj)))
}

// Decode a PEM (PKCS#8 private key) to its DER bytes for crypto.subtle.importKey.
function pemToDer(pem: string): Uint8Array {
  const body = pem
    .replace(/-----BEGIN [^-]+-----/, '')
    .replace(/-----END [^-]+-----/, '')
    .replace(/\s+/g, '')
  const raw = atob(body)
  const der = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) der[i] = raw.charCodeAt(i)
  return der
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'pkcs8',
    pemToDer(pem),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )
}

// Normalize/validate the actions param. Returns null if it carries anything outside
// VALID_ACTIONS (and isn't the "*" wildcard) — the caller turns that into a 400.
export function normalizeActions(raw: string | null | undefined): string | null {
  const v = (raw ?? '').trim()
  if (!v) return DEFAULT_ACTIONS
  // No "*" wildcard: a caller must name the exact actions it needs (least privilege).
  const parts = v.split(',').map((p) => p.trim()).filter(Boolean)
  if (parts.length === 0 || !parts.every((p) => VALID_ACTIONS.has(p))) return null
  return parts.join(',')
}

// Clamp ttl to (0, MAX_TTL]; falls back to DEFAULT_TTL when unset/invalid.
export function normalizeTtl(raw: number | undefined): number {
  if (!Number.isFinite(raw) || (raw as number) <= 0) return DEFAULT_TTL
  return Math.min(raw as number, MAX_TTL)
}

export interface MintOptions {
  slug: string
  actions?: string // comma-separated subset of read,write,verify; defaults to read (no "*")
  ttl?: number // seconds; clamped to MAX_TTL (default 3600)
  sub?: string // subject claim, for audit (default "lfs-client")
  now?: number // unix seconds — injectable for deterministic tests
}

export interface MintResult {
  token: string
  scope: string
  expiresIn: number
}

// Mint a Giftless LFS client JWT scoped to one repo.
export async function mintLfsToken(privateKeyPem: string, opts: MintOptions): Promise<MintResult> {
  const now = opts.now ?? Math.floor(Date.now() / 1000)
  const ttl = normalizeTtl(opts.ttl)
  const actions = normalizeActions(opts.actions)
  if (actions === null) throw new Error('invalid actions')
  const scope = `obj:${LFS_ORG}/${opts.slug}/*:${actions}`

  const header = { alg: 'RS256', typ: 'JWT', kid: KEY_ID }
  const payload = {
    sub: opts.sub || 'lfs-client',
    iss: ISSUER,
    iat: now,
    nbf: now,
    exp: now + ttl,
    scopes: [scope],
  }
  const signingInput = `${b64urlJson(header)}.${b64urlJson(payload)}`
  const key = await importPrivateKey(privateKeyPem)
  const sig = await crypto.subtle.sign({ name: 'RSASSA-PKCS1-v1_5' }, key, enc.encode(signingInput))
  return { token: `${signingInput}.${b64url(new Uint8Array(sig))}`, scope, expiresIn: ttl }
}
