// D1 helpers for the deploy API. Kept tiny and dependency-free.

export async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

// Resolve a bearer token to a user id, or null if unknown/revoked.
export async function userForToken(db: D1Database, token: string): Promise<string | null> {
  const hash = await sha256Hex(token)
  const row = await db
    .prepare('SELECT user_id FROM tokens WHERE hash = ? AND revoked_at IS NULL')
    .bind(hash)
    .first<{ user_id: string }>()
  return row?.user_id ?? null
}

// Resolve a bearer token straight to the owner's GitHub login (for `whoami` /
// "Logged in as @user"), or null if the token is unknown/revoked. One round-trip.
export async function loginForToken(db: D1Database, token: string): Promise<string | null> {
  const hash = await sha256Hex(token)
  const row = await db
    .prepare(
      'SELECT u.login AS login FROM tokens t JOIN users u ON u.id = t.user_id WHERE t.hash = ? AND t.revoked_at IS NULL'
    )
    .bind(hash)
    .first<{ login: string }>()
  return row?.login ?? null
}

// Resolve a bearer token to the owner's user id AND GitHub login in one round-trip.
// The id feeds project-ownership checks; the login is folded into the minted LFS
// token's `sub` claim for auditability. null if the token is unknown/revoked.
export async function userRowForToken(
  db: D1Database,
  token: string
): Promise<{ id: string; login: string } | null> {
  const hash = await sha256Hex(token)
  const row = await db
    .prepare(
      'SELECT u.id AS id, u.login AS login FROM tokens t JOIN users u ON u.id = t.user_id WHERE t.hash = ? AND t.revoked_at IS NULL'
    )
    .bind(hash)
    .first<{ id: string; login: string }>()
  return row ?? null
}

export type ProjectResult =
  | { ok: true; projectId: string }
  | { ok: false; reason: 'conflict' }

// Find or create the project for (user, slug). A slug owned by another user is a conflict.
export async function ensureProject(
  db: D1Database,
  userId: string,
  slug: string
): Promise<ProjectResult> {
  const find = () =>
    db
      .prepare('SELECT id, user_id FROM projects WHERE slug = ?')
      .bind(slug)
      .first<{ id: string; user_id: string }>()

  const existing = await find()
  if (existing) {
    if (existing.user_id !== userId) return { ok: false, reason: 'conflict' }
    return { ok: true, projectId: existing.id }
  }

  // Race window: two concurrent first-deploys of the same slug both pass the SELECT.
  // Use INSERT … ON CONFLICT DO NOTHING, then re-read to resolve the winner.
  const id = crypto.randomUUID()
  await db
    .prepare('INSERT INTO projects (id, user_id, slug) VALUES (?, ?, ?) ON CONFLICT(slug) DO NOTHING')
    .bind(id, userId, slug)
    .run()
  const row = await find()
  if (!row) return { ok: false, reason: 'conflict' } // shouldn't happen, but fail closed
  if (row.user_id !== userId) return { ok: false, reason: 'conflict' }
  return { ok: true, projectId: row.id }
}

export type OwnedProjectResult =
  | { ok: true; projectId: string }
  | { ok: false; reason: 'not_found' | 'conflict' }

// Look up an EXISTING project owned by userId. Unlike ensureProject, this NEVER
// creates a row — minting an LFS token must not allocate ownership (po-g9y.13
// security fix: prevents an authenticated caller squatting an unclaimed slug, esp.
// one that already has objects in R2). 'not_found' = no project with that slug;
// 'conflict' = it exists but belongs to another account.
export async function getOwnedProject(
  db: D1Database,
  userId: string,
  slug: string
): Promise<OwnedProjectResult> {
  const row = await db
    .prepare('SELECT id, user_id FROM projects WHERE slug = ?')
    .bind(slug)
    .first<{ id: string; user_id: string }>()
  if (!row) return { ok: false, reason: 'not_found' }
  if (row.user_id !== userId) return { ok: false, reason: 'conflict' }
  return { ok: true, projectId: row.id }
}

export async function recordDeployment(
  db: D1Database,
  projectId: string,
  status: string,
  files: number,
  bytes: number
): Promise<string> {
  const id = crypto.randomUUID()
  await db
    .prepare('INSERT INTO deployments (id, project_id, status, files, bytes) VALUES (?, ?, ?, ?, ?)')
    .bind(id, projectId, status, files, bytes)
    .run()
  return id
}

export async function getDeployment(db: D1Database, id: string) {
  return db
    .prepare('SELECT id, project_id, status, files, bytes, created_at FROM deployments WHERE id = ?')
    .bind(id)
    .first()
}
