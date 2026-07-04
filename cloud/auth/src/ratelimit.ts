// Rate limiting for magic-link sends (po-jwn). POST /email/start mints + emails a sign-in
// link for any address, with no auth — so it's an abuse vector two ways:
//   - Email-bombing: repeated POSTs for a victim's address flood their inbox with links.
//   - Cost/quota abuse: each accepted send burns Resend quota.
// We gate by BOTH the target email and the source IP using a true sliding window: count the
// ACCEPTED sends in the trailing window and refuse once either cap is hit. Worker-side (a
// small D1 table) rather than a Cloudflare dashboard WAF rule so the limit ships with the
// code and is unit-testable. `now` (epoch seconds) is injected, matching email.ts.

export const EMAIL_SEND_MAX_PER_EMAIL = 3 // sends per address …
export const EMAIL_SEND_WINDOW_EMAIL = 15 * 60 // … per 15 minutes
export const EMAIL_SEND_MAX_PER_IP = 10 // sends per source IP …
export const EMAIL_SEND_WINDOW_IP = 60 * 60 // … per hour

// Check the sliding windows and, if under both caps, RECORD the send and allow it.
// Blocked requests are deliberately NOT recorded: a flood must not push the window forward
// (which would extend the block indefinitely and let a slow-drip attacker never recover).
// Returns true when the caller should send the magic link, false when it should silently
// skip the send (the caller keeps the response neutral either way — no enumeration signal).
export async function gateEmailSend(
  db: D1Database,
  nowSeconds: number,
  email: string,
  ip: string
): Promise<boolean> {
  const emailCount = await countSince(db, 'email', email, nowSeconds - EMAIL_SEND_WINDOW_EMAIL)
  if (emailCount >= EMAIL_SEND_MAX_PER_EMAIL) return false

  // Only gate on IP when we actually have one; a missing CF-Connecting-IP must not collapse
  // every unknown-IP caller into one shared '' bucket and lock them all out at once.
  if (ip) {
    const ipCount = await countSince(db, 'ip', ip, nowSeconds - EMAIL_SEND_WINDOW_IP)
    if (ipCount >= EMAIL_SEND_MAX_PER_IP) return false
  }

  await db
    .prepare('INSERT INTO email_send_log (id, email, ip, created_at) VALUES (?, ?, ?, ?)')
    .bind(crypto.randomUUID(), email, ip, nowSeconds)
    .run()

  // Opportunistic prune so the table stays bounded: nothing older than the longest window
  // (the per-IP hour) can still affect any future count.
  await db
    .prepare('DELETE FROM email_send_log WHERE created_at <= ?')
    .bind(nowSeconds - EMAIL_SEND_WINDOW_IP)
    .run()

  return true
}

async function countSince(
  db: D1Database,
  key: 'email' | 'ip',
  value: string,
  since: number
): Promise<number> {
  const sql =
    key === 'email'
      ? 'SELECT COUNT(*) AS n FROM email_send_log WHERE email = ? AND created_at > ?'
      : 'SELECT COUNT(*) AS n FROM email_send_log WHERE ip = ? AND created_at > ?'
  const row = await db.prepare(sql).bind(value, since).first<{ n: number }>()
  return row?.n ?? 0
}
