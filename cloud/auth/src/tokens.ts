// User + API-token persistence (shared D1 with the deploy API). Tokens are stored as a
// SHA-256 hex hash — matching the deploy API's `userForToken` — and shown to the user once.

import { b64url, sha256Hex } from './util'

export function generateToken(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return 'arc_' + b64url(bytes)
}

// Result of an upsert: the user id, plus whether this call created the row (a genuinely NEW
// signup) vs. attached to an existing account (a return sign-in). `isNew` drives the
// arc_signup_completed analytics so re-logins don't inflate the signup funnel (po-zbx). It's
// decided by the pre-insert lookup — accurate outside the rare concurrent-first-signup race.
export interface UpsertResult {
  id: string
  isNew: boolean
}

// `email` is the account's primary VERIFIED GitHub address (po-rxf) — null when the user
// didn't grant `user:email`, has no verified address, or the lookup failed. It is stored on
// the row so GitHub signups are contactable like email signups are; a null simply leaves the
// column as-is and the next sign-in tries again. `nowIso` stamps email_verified_at (GitHub
// already verified the address, so it counts as verified here too).
export async function upsertUser(
  db: D1Database,
  githubId: number,
  login: string,
  email?: string | null,
  nowIso?: string
): Promise<UpsertResult> {
  const find = () =>
    db.prepare('SELECT id FROM users WHERE github_id = ?').bind(githubId).first<{ id: string }>()
  const existing = await find()
  // users.email is UNIQUE. If some OTHER row already holds this address (an email-provider
  // signup that later came back via GitHub), writing it would violate the index and break
  // sign-in. Account linking is a separate decision (po-5ai) — until then, drop the email and
  // let the user sign in normally.
  const claimable = email ? await emailIsFree(db, email, existing?.id) : false
  const verifiedAt = nowIso ?? new Date().toISOString()

  if (existing) {
    await db.prepare('UPDATE users SET login = ? WHERE id = ?').bind(login, existing.id).run()
    if (claimable) {
      // Guarded by its own statement so a lost race on the unique index can't fail sign-in.
      await tryRun(() =>
        db
          .prepare(
            "UPDATE users SET email = ?, auth_provider = COALESCE(auth_provider, 'github'), email_verified_at = ? WHERE id = ?"
          )
          .bind(email, verifiedAt, existing.id)
          .run()
      )
    }
    return { id: existing.id, isNew: false }
  }
  // Atomic under concurrent OAuth callbacks for the same github_id: the loser's INSERT
  // updates the login instead of failing the unique constraint. Re-read for the winner's id.
  const id = crypto.randomUUID()
  const inserted = await tryRun(() =>
    db
      .prepare(
        "INSERT INTO users (id, github_id, login, email, auth_provider, email_verified_at) VALUES (?, ?, ?, ?, 'github', ?) ON CONFLICT(github_id) DO UPDATE SET login = excluded.login"
      )
      .bind(id, githubId, login, claimable ? email : null, claimable ? verifiedAt : null)
      .run()
  )
  if (!inserted) {
    // Only the email index can fail here (github_id conflicts are absorbed above), and only
    // if another row claimed the address between the check and the insert. Retry emailless.
    await db
      .prepare(
        "INSERT INTO users (id, github_id, login, email, auth_provider, email_verified_at) VALUES (?, ?, ?, ?, 'github', ?) ON CONFLICT(github_id) DO UPDATE SET login = excluded.login"
      )
      .bind(id, githubId, login, null, null)
      .run()
  }
  return { id: (await find())?.id ?? id, isNew: true }
}

// True when no OTHER user row holds this address (self is fine — it's a refresh).
async function emailIsFree(db: D1Database, email: string, selfId?: string): Promise<boolean> {
  const owner = await db
    .prepare('SELECT id FROM users WHERE email = ?')
    .bind(email)
    .first<{ id: string }>()
  return !owner || owner.id === selfId
}

// Run a statement, reporting failure instead of throwing. Used only where the failure mode is
// a unique-index race on users.email and the correct response is "sign in anyway".
async function tryRun(run: () => Promise<unknown>): Promise<boolean> {
  try {
    await run()
    return true
  } catch {
    return false
  }
}

export interface EmailUserProfile {
  fullName?: string | null
  org?: string | null
}

// Upsert an email-provider user (po-e6j). Lands in the SAME users table as GitHub sign-in:
// find by email → refresh profile + stamp email_verified_at; else insert a github_id-less
// row with auth_provider='email'. Returns the user id. `login` stays NULL for email users
// (the dashboard / whoami fall back to email or full_name).
export async function upsertEmailUser(
  db: D1Database,
  email: string,
  profile: EmailUserProfile,
  nowIso: string
): Promise<UpsertResult> {
  const fullName = profile.fullName?.trim() || null
  const org = profile.org?.trim() || null
  const find = () =>
    db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first<{ id: string }>()

  const existing = await find()
  if (existing) {
    // COALESCE keeps a previously-captured name/org if this sign-in didn't supply one.
    await db
      .prepare(
        'UPDATE users SET full_name = COALESCE(?, full_name), org = COALESCE(?, org), email_verified_at = ? WHERE id = ?'
      )
      .bind(fullName, org, nowIso, existing.id)
      .run()
    return { id: existing.id, isNew: false }
  }
  // Atomic under concurrent verifies for the same email: the loser's INSERT updates instead
  // of failing the unique index. Re-read for the winner's id (mirrors upsertUser).
  const id = crypto.randomUUID()
  await db
    .prepare(
      "INSERT INTO users (id, email, auth_provider, full_name, org, email_verified_at) VALUES (?, ?, 'email', ?, ?, ?) ON CONFLICT(email) DO UPDATE SET full_name = COALESCE(excluded.full_name, users.full_name), org = COALESCE(excluded.org, users.org), email_verified_at = excluded.email_verified_at"
    )
    .bind(id, email, fullName, org, nowIso)
    .run()
  return { id: (await find())?.id ?? id, isNew: true }
}

// Create a token, store only its hash, return the clear-text token (shown once).
export async function createToken(db: D1Database, userId: string, label: string): Promise<string> {
  const token = generateToken()
  await db
    .prepare('INSERT INTO tokens (id, user_id, hash, label) VALUES (?, ?, ?, ?)')
    .bind(crypto.randomUUID(), userId, await sha256Hex(token), label || 'token')
    .run()
  return token
}

export interface TokenRow {
  id: string
  label: string
  created_at: string
  revoked_at: string | null
}

export async function listTokens(db: D1Database, userId: string): Promise<TokenRow[]> {
  // COALESCE the label: the column is nullable but TokenRow.label is a string the
  // dashboard passes straight to esc() — a NULL would crash the render.
  const res = await db
    .prepare("SELECT id, COALESCE(label, 'token') AS label, created_at, revoked_at FROM tokens WHERE user_id = ? ORDER BY created_at DESC")
    .bind(userId)
    .all<TokenRow>()
  return res.results ?? []
}

// Scoped to the owner so one user can't revoke another's token.
export async function revokeToken(db: D1Database, userId: string, tokenId: string): Promise<void> {
  await db
    .prepare("UPDATE tokens SET revoked_at = datetime('now') WHERE id = ? AND user_id = ? AND revoked_at IS NULL")
    .bind(tokenId, userId)
    .run()
}
