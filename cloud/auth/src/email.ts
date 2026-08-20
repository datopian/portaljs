// Passwordless email sign-in (po-e6j) — magic-link flow, the low-friction front door for
// the /build audience (orgs/gov/ngo who mostly lack GitHub). Sits ALONGSIDE GitHub OAuth
// and lands in the SAME users table.
//
//   1. user → POST /email/start { email }      → mint token, email a magic link
//   2. user → GET  /email/verify?token=…       → confirmation page (one explicit click)
//   3. user → POST /email/verify { token }     → consume once → session issued
//
// `now` (epoch seconds) is passed in rather than read from the clock, so the flow is
// unit-testable without faking time (same pattern as session.ts / device.ts).

import { b64url, sha256Hex } from './util'

export const EMAIL_TOKEN_TTL = 30 * 60 // seconds a magic link is valid before it must be re-requested

// po-r80: the magic link is `${BASE_URL}/email/verify?token=<token>` — the ONLY literal '='
// in the whole message is that query separator. Some hop in mail delivery (a security
// gateway that rewrites/scans links, or a buggy quoted-printable transcoder) can mistake a
// raw '=' followed by two hex digits (e.g. "=2B") for a QP escape and decode it to one byte,
// silently corrupting the link ("?token=2Bxyz…" -> "?token+xyz…", losing the "2B" and
// substituting '+' — 0x2B). b64url's alphabet includes hex-looking chars (0-9a-fA-F), so
// ~12% of random tokens would start with two of them and be at risk. Prefixing every token
// with a fixed non-hex character makes "=" always followed by a non-hex char, so the "=XY"
// escape pattern can never form — closing the failure class regardless of the random bytes.
const EMAIL_TOKEN_PREFIX = 'z' // not in 0-9a-fA-F

// Long opaque secret embedded in the magic link; only its hash is stored, matching the
// tokens / device_codes tables.
export function generateEmailToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return EMAIL_TOKEN_PREFIX + b64url(bytes)
}

// Canonicalize an address for storage/lookup: trim + lowercase. Case-insensitive so
// "User@Example.com" and "user@example.com" are the same account.
export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase()
}

// Pragmatic email check — not RFC 5322, just enough to reject obvious junk before we spend
// a send. Requires a single @, a non-empty local part, and a dotted domain with no spaces.
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254
}

// Free/consumer email providers. The /build front door is for orgs (gov/ngo/enterprise/smb);
// individuals on free mail are steered to the terminal path instead (po-76p). The /build page
// enforces this client-side for a friendly message; this list is the server-side backstop so a
// JS-bypassed POST to /email/start still doesn't burn a Resend send on a consumer address.
// Kept in sync with site/lib/freemail.ts (two build roots, no shared import).
export const FREE_EMAIL_DOMAINS: ReadonlySet<string> = new Set([
  'gmail.com', 'googlemail.com',
  'yahoo.com', 'yahoo.co.uk', 'yahoo.co.in', 'yahoo.fr', 'yahoo.de', 'ymail.com', 'rocketmail.com',
  'outlook.com', 'hotmail.com', 'hotmail.co.uk', 'live.com', 'msn.com',
  'icloud.com', 'me.com', 'mac.com',
  'proton.me', 'protonmail.com', 'pm.me',
  'aol.com', 'gmx.com', 'gmx.net', 'mail.com', 'yandex.com', 'yandex.ru',
  'zoho.com', 'tutanota.com', 'fastmail.com', 'hey.com', 'inbox.com', 'hushmail.com',
])

// True when `email`'s domain is a known free/consumer provider. Case-insensitive; expects an
// already-plausible address (call after isValidEmail).
export function isFreeEmailDomain(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase().trim()
  return !!domain && FREE_EMAIL_DOMAINS.has(domain)
}

export interface EmailProfile {
  fullName?: string
  org?: string
}

export interface EmailLoginStart {
  token: string // clear token — goes in the magic link only, never persisted
  expiresIn: number
}

// Step 1: mint a pending magic-link token for `email`. Optional profile (full_name/org)
// captured at sign-up is carried on the row and copied to the user on verify. `distinctId`
// is the client's PostHog anonymous id (po-zbx): stashed on the row so the server-side
// arc_signup_completed event fired at verify time attributes to the SAME person as the
// client's build_email_sent — joining the /build funnel across the client→server boundary.
export async function createEmailLogin(
  db: D1Database,
  nowSeconds: number,
  email: string,
  profile: EmailProfile = {},
  returnPath?: string,
  distinctId?: string
): Promise<EmailLoginStart> {
  const token = generateEmailToken()
  // Cap concurrent live links per address (po-jwn): expire any still-valid pending token for
  // this email so a flood of /email/start calls can't stockpile many simultaneously-usable
  // links — only the newest one works. Setting expires_at into the past makes the old rows
  // read as `expired` in both peekEmailLogin and verifyEmailLogin (which compare now > expires_at).
  await db
    .prepare("UPDATE email_logins SET expires_at = ? WHERE email = ? AND status = 'pending' AND expires_at >= ?")
    .bind(nowSeconds - 1, email, nowSeconds)
    .run()
  await db
    .prepare(
      'INSERT INTO email_logins (id, token_hash, email, full_name, org, return_path, status, created_at, expires_at, ph_distinct_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .bind(
      crypto.randomUUID(),
      await sha256Hex(token),
      email,
      (profile.fullName ?? '').slice(0, 120) || null,
      (profile.org ?? '').slice(0, 120) || null,
      returnPath ?? null,
      'pending',
      nowSeconds,
      nowSeconds + EMAIL_TOKEN_TTL,
      (distinctId ?? '').slice(0, 200) || null
    )
    .run()
  return { token, expiresIn: EMAIL_TOKEN_TTL }
}

// Read a pending magic-link token WITHOUT consuming it — backs the GET confirmation page,
// so we can show which address is being signed in before the user clicks.
export interface EmailLoginPeek {
  status: 'valid' | 'not_found' | 'expired' | 'used'
  email?: string
}
export async function peekEmailLogin(
  db: D1Database,
  nowSeconds: number,
  token: string
): Promise<EmailLoginPeek> {
  const row = await lookup(db, token)
  if (!row) return { status: 'not_found' }
  if (row.status === 'claimed') return { status: 'used' }
  if (nowSeconds > row.expires_at) return { status: 'expired' }
  return { status: 'valid', email: row.email }
}

export type EmailVerifyResult =
  | {
      status: 'verified'
      email: string
      fullName: string | null
      org: string | null
      returnPath: string | null
      distinctId: string | null // client PostHog anon id captured at sign-up (po-zbx), if any
    }
  | { status: 'not_found' }
  | { status: 'expired' }
  | { status: 'used' }

// Step 3: consume the token exactly once. Flips pending → claimed BEFORE returning success
// so a duplicate POST (double-click / email prefetch replay) can't sign in twice: the
// racing request reads status='claimed' → 'used'. Same guard as claimDeviceToken.
export async function verifyEmailLogin(
  db: D1Database,
  nowSeconds: number,
  token: string
): Promise<EmailVerifyResult> {
  const row = await lookup(db, token)
  if (!row) return { status: 'not_found' }
  if (row.status === 'claimed') return { status: 'used' }
  if (nowSeconds > row.expires_at) return { status: 'expired' }
  const res = await db
    .prepare("UPDATE email_logins SET status = 'claimed' WHERE id = ? AND status = 'pending'")
    .bind(row.id)
    .run()
  // If no row flipped, another request already claimed it in the race window.
  if (res.meta && typeof res.meta.changes === 'number' && res.meta.changes === 0) {
    return { status: 'used' }
  }
  return {
    status: 'verified',
    email: row.email,
    fullName: row.full_name,
    org: row.org,
    returnPath: row.return_path,
    distinctId: row.ph_distinct_id,
  }
}

interface EmailLoginRow {
  id: string
  email: string
  full_name: string | null
  org: string | null
  return_path: string | null
  status: string
  expires_at: number
  ph_distinct_id: string | null
}
async function lookup(db: D1Database, token: string): Promise<EmailLoginRow | null> {
  if (!token) return null
  const hash = await sha256Hex(token)
  return db
    .prepare(
      'SELECT id, email, full_name, org, return_path, status, expires_at, ph_distinct_id FROM email_logins WHERE token_hash = ?'
    )
    .bind(hash)
    .first<EmailLoginRow>()
}

// --- Delivery ---------------------------------------------------------------
// Resend HTTPS API (decided po-e6j): a single secret (RESEND_API_KEY), no MX record or
// send_email binding needed to run/test — the GitHub OAuth path calls fetch() the same way.
// Swappable: everything above is delivery-agnostic; only this function talks to a provider.

export interface EmailEnv {
  RESEND_API_KEY: string
  EMAIL_FROM: string // e.g. "PortalJS Arc <login@arc.portaljs.com>"
}

// po-0k2: the caller's response to the user stays NEUTRAL no matter what happens here (no
// address-enumeration signal) — so this function is the ONLY place a Resend failure can be
// observed at all. It must not throw and must not let a failure pass silently: every non-ok
// response and every thrown fetch (e.g. the intermittent Resend timeouts) is logged with
// enough detail (status + body, or the error) to diagnose from `wrangler tail` alone.
export async function sendMagicLinkEmail(env: EmailEnv, to: string, link: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to,
        subject: 'Sign in to PortalJS Arc',
        text: `Sign in to PortalJS Arc:\n\n${link}\n\nThis link expires in 30 minutes. If you didn't request it, you can ignore this email.`,
        html: magicLinkHtml(link),
      }),
    })
    if (!res.ok) {
      console.error('magic-link send failed', res.status, await res.text().catch(() => '<no body>'))
    }
    return res.ok
  } catch (err) {
    console.error('magic-link send threw', err instanceof Error ? err.message : String(err))
    return false
  }
}

function magicLinkHtml(link: string): string {
  // Minimal, inline-styled HTML (email clients strip <style>/external CSS). `link` is a
  // server-minted same-origin URL, not user input, so it needs no escaping here.
  return `<!doctype html><html><body style="font-family:system-ui,sans-serif;color:#1f2937;line-height:1.5">
  <h2 style="font-weight:700">Sign in to PortalJS Arc</h2>
  <p>Click the button below to finish signing in. This link expires in 30 minutes.</p>
  <p><a href="${link}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:.7rem 1.2rem;border-radius:8px;font-weight:600">Sign in to Arc</a></p>
  <p style="color:#6b7280;font-size:.85rem">If you didn't request this, you can safely ignore this email.</p>
  </body></html>`
}
