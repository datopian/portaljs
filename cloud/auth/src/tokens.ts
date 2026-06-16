// User + API-token persistence (shared D1 with the deploy API). Tokens are stored as a
// SHA-256 hex hash — matching the deploy API's `userForToken` — and shown to the user once.

import { b64url, sha256Hex } from './util'

export function generateToken(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  return 'arc_' + b64url(bytes)
}

export async function upsertUser(db: D1Database, githubId: number, login: string): Promise<string> {
  const find = () =>
    db.prepare('SELECT id FROM users WHERE github_id = ?').bind(githubId).first<{ id: string }>()
  const existing = await find()
  if (existing) {
    await db.prepare('UPDATE users SET login = ? WHERE id = ?').bind(login, existing.id).run()
    return existing.id
  }
  // Atomic under concurrent OAuth callbacks for the same github_id: the loser's INSERT
  // updates the login instead of failing the unique constraint. Re-read for the winner's id.
  const id = crypto.randomUUID()
  await db
    .prepare(
      'INSERT INTO users (id, github_id, login) VALUES (?, ?, ?) ON CONFLICT(github_id) DO UPDATE SET login = excluded.login'
    )
    .bind(id, githubId, login)
    .run()
  return (await find())?.id ?? id
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
