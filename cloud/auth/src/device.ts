// Device-authorization flow (po-j57) — the gh/wrangler model for CLI sign-in.
//
//   1. CLI   → POST /device/code         → { device_code (secret), user_code (short) }
//   2. user  → opens /activate, signs in with GitHub, enters user_code, clicks Authorize
//   3. CLI   → POST /device/token (polls) → 428 until approved, then { token } once
//
// `now` (epoch seconds) is passed in rather than read from the clock, so the whole flow
// is unit-testable without faking time (same pattern as session.ts).

import { b64url, sha256Hex } from './util'
import { createToken } from './tokens'

export const DEVICE_CODE_TTL = 15 * 60 // seconds a code is valid before it must be re-requested
export const POLL_INTERVAL = 5 // seconds the CLI should wait between polls

// Unambiguous alphabet for the human-typed code: no 0/O/1/I/L to avoid mis-keying.
const USER_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const USER_CODE_LEN = 8

// Long opaque secret the CLI keeps and polls with; only its hash is stored.
export function generateDeviceCode(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return b64url(bytes)
}

// Short code the user reads off the terminal and types into the browser. Stored and
// compared in canonical form (uppercase, no separator); displayed with a dash.
export function generateUserCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(USER_CODE_LEN))
  let s = ''
  for (let i = 0; i < USER_CODE_LEN; i++) s += USER_CODE_ALPHABET[bytes[i] % USER_CODE_ALPHABET.length]
  return s
}

// Canonicalize user input: drop everything but [A-Z0-9], uppercase. So "abcd-efgh",
// "abcd efgh", "ABCDEFGH" all match the stored code.
export function normalizeUserCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

// Pretty form for display: XXXX-XXXX.
export function formatUserCode(code: string): string {
  return code.length === USER_CODE_LEN ? `${code.slice(0, 4)}-${code.slice(4)}` : code
}

// Auto-label issued tokens so the user never names one: "cli · <hint> · <date>".
export function deviceTokenLabel(label: string | null | undefined, nowSeconds: number): string {
  const date = new Date(nowSeconds * 1000).toISOString().slice(0, 10)
  const parts = ['cli']
  const hint = label?.trim()
  if (hint) parts.push(hint)
  parts.push(date)
  return parts.join(' · ').slice(0, 60)
}

export interface DeviceCodeStart {
  deviceCode: string
  userCode: string
  interval: number
  expiresIn: number
}

// Step 1: mint a pending device code. `label` is an optional CLI hint (e.g. hostname).
export async function createDeviceCode(
  db: D1Database,
  nowSeconds: number,
  label?: string
): Promise<DeviceCodeStart> {
  const deviceCode = generateDeviceCode()
  const userCode = generateUserCode()
  await db
    .prepare(
      'INSERT INTO device_codes (id, device_hash, user_code, label, status, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    .bind(
      crypto.randomUUID(),
      await sha256Hex(deviceCode),
      userCode,
      (label ?? '').slice(0, 60) || null,
      'pending',
      nowSeconds,
      nowSeconds + DEVICE_CODE_TTL
    )
    .run()
  return { deviceCode, userCode, interval: POLL_INTERVAL, expiresIn: DEVICE_CODE_TTL }
}

export type ApproveResult = 'approved' | 'not_found' | 'expired' | 'already'

// Step 2: a signed-in user approves a user_code. Idempotent — re-approving an already
// approved (not yet claimed) code is fine.
export async function approveDeviceCode(
  db: D1Database,
  nowSeconds: number,
  userId: string,
  userCodeRaw: string
): Promise<ApproveResult> {
  const userCode = normalizeUserCode(userCodeRaw)
  if (!userCode) return 'not_found'
  const row = await db
    .prepare('SELECT id, status, expires_at FROM device_codes WHERE user_code = ?')
    .bind(userCode)
    .first<{ id: string; status: string; expires_at: number }>()
  if (!row) return 'not_found'
  if (row.status === 'claimed') return 'already'
  if (nowSeconds > row.expires_at) return 'expired'
  await db
    .prepare("UPDATE device_codes SET status = 'approved', user_id = ? WHERE id = ? AND status IN ('pending','approved')")
    .bind(userId, row.id)
    .run()
  return 'approved'
}

export type ClaimResult =
  | { status: 'pending' }
  | { status: 'expired' }
  | { status: 'used' }
  | { status: 'not_found' }
  | { status: 'issued'; token: string }

// Step 3: the CLI polls with its device_code. Returns the token exactly once on the
// first poll after approval; subsequent polls see 'used'.
export async function claimDeviceToken(
  db: D1Database,
  nowSeconds: number,
  deviceCode: string
): Promise<ClaimResult> {
  if (!deviceCode) return { status: 'not_found' }
  const hash = await sha256Hex(deviceCode)
  const row = await db
    .prepare('SELECT id, user_id, status, label, expires_at FROM device_codes WHERE device_hash = ?')
    .bind(hash)
    .first<{ id: string; user_id: string | null; status: string; label: string | null; expires_at: number }>()
  if (!row) return { status: 'not_found' }
  if (row.status === 'claimed') return { status: 'used' }
  if (nowSeconds > row.expires_at) return { status: 'expired' }
  if (row.status !== 'approved' || !row.user_id) return { status: 'pending' }
  // Flip to terminal BEFORE issuing so a duplicate poll can't mint a second token: a
  // racing poll then reads status='claimed' → 'used'. (Workers handle one request at a
  // time per isolate; this guards the rare cross-isolate double-poll.)
  await db
    .prepare("UPDATE device_codes SET status = 'claimed' WHERE id = ? AND status = 'approved'")
    .bind(row.id)
    .run()
  const token = await createToken(db, row.user_id, deviceTokenLabel(row.label, nowSeconds))
  return { status: 'issued', token }
}
