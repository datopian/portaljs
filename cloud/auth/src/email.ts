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

// Long opaque secret embedded in the magic link; only its hash is stored, matching the
// tokens / device_codes tables.
export function generateEmailToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return b64url(bytes)
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
// captured at sign-up is carried on the row and copied to the user on verify.
export async function createEmailLogin(
  db: D1Database,
  nowSeconds: number,
  email: string,
  profile: EmailProfile = {},
  returnPath?: string
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
      'INSERT INTO email_logins (id, token_hash, email, full_name, org, return_path, status, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
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
      nowSeconds + EMAIL_TOKEN_TTL
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
  | { status: 'verified'; email: string; fullName: string | null; org: string | null; returnPath: string | null }
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
  return { status: 'verified', email: row.email, fullName: row.full_name, org: row.org, returnPath: row.return_path }
}

interface EmailLoginRow {
  id: string
  email: string
  full_name: string | null
  org: string | null
  return_path: string | null
  status: string
  expires_at: number
}
async function lookup(db: D1Database, token: string): Promise<EmailLoginRow | null> {
  if (!token) return null
  const hash = await sha256Hex(token)
  return db
    .prepare('SELECT id, email, full_name, org, return_path, status, expires_at FROM email_logins WHERE token_hash = ?')
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

export async function sendMagicLinkEmail(env: EmailEnv, to: string, link: string): Promise<boolean> {
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
  return res.ok
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
