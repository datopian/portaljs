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
      // COALESCE(login, email): email-provider users (po-e6j) have a NULL github login,
      // so fall back to their email for "Logged in as …".
      'SELECT COALESCE(u.login, u.email) AS login FROM tokens t JOIN users u ON u.id = t.user_id WHERE t.hash = ? AND t.revoked_at IS NULL'
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
      // COALESCE(login, email): email-provider users (po-e6j) carry a NULL github login;
      // fall back to email so the minted LFS token's `sub` claim stays populated.
      'SELECT u.id AS id, COALESCE(u.login, u.email) AS login FROM tokens t JOIN users u ON u.id = t.user_id WHERE t.hash = ? AND t.revoked_at IS NULL'
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

// Resolve a bearer token to the owner's id, login, AND staff flag in one round-trip
// (po-ce7 source-snapshot retrieval: staff may fetch ANY tenant's snapshot, not just
// their own). null if the token is unknown/revoked.
export async function userAuthForToken(
  db: D1Database,
  token: string
): Promise<{ id: string; login: string; isStaff: boolean } | null> {
  const hash = await sha256Hex(token)
  const row = await db
    .prepare(
      'SELECT u.id AS id, COALESCE(u.login, u.email) AS login, u.is_staff AS is_staff FROM tokens t JOIN users u ON u.id = t.user_id WHERE t.hash = ? AND t.revoked_at IS NULL'
    )
    .bind(hash)
    .first<{ id: string; login: string; is_staff: number }>()
  return row ? { id: row.id, login: row.login, isStaff: !!row.is_staff } : null
}

export type DeploymentWithProject = {
  id: string
  project_id: string
  slug: string
  user_id: string
  owner_login: string
  status: string
  files: number
  bytes: number
  source_key: string | null
  source_bytes: number | null
  created_at: string
}

// A deployment joined with its owning project — slug + owner in one round-trip, the
// linkage po-ce7's ownership/retrieval checks need (deployment -> project -> owner).
export async function getDeploymentWithProject(
  db: D1Database,
  deploymentId: string
): Promise<DeploymentWithProject | null> {
  return db
    .prepare(
      `SELECT d.id AS id, d.project_id AS project_id, p.slug AS slug, p.user_id AS user_id,
              COALESCE(u.login, u.email) AS owner_login, d.status AS status, d.files AS files,
              d.bytes AS bytes, d.source_key AS source_key, d.source_bytes AS source_bytes,
              d.created_at AS created_at
       FROM deployments d JOIN projects p ON p.id = d.project_id JOIN users u ON u.id = p.user_id
       WHERE d.id = ?`
    )
    .bind(deploymentId)
    .first<DeploymentWithProject>()
}

export type ClaimSnapshotResult = 'claimed' | 'already_recorded'

// Atomically "claim" a deployment's source-snapshot slot: only the first caller for a
// given deployment_id gets 'claimed' (the UPDATE's WHERE excludes rows that already have
// a source_key), so a concurrent double-upload can't silently overwrite an earlier
// snapshot — immutability the bead calls for. Callers write to R2 only after claiming.
export async function claimSourceSnapshot(
  db: D1Database,
  deploymentId: string,
  r2Key: string,
  bytes: number
): Promise<ClaimSnapshotResult> {
  const res = await db
    .prepare('UPDATE deployments SET source_key = ?, source_bytes = ? WHERE id = ? AND source_key IS NULL')
    .bind(r2Key, bytes, deploymentId)
    .run()
  return (res.meta?.changes ?? 0) > 0 ? 'claimed' : 'already_recorded'
}

export type SourceSnapshot = {
  deployment_id: string
  source_key: string
  source_bytes: number
  created_at: string
}

// All source snapshots recorded for a slug, newest first — the "given a slug, find its
// source history" linkage the bead's acceptance criteria ask for.
export async function listSourceSnapshots(db: D1Database, slug: string): Promise<SourceSnapshot[]> {
  const res = await db
    .prepare(
      `SELECT d.id AS deployment_id, d.source_key AS source_key, d.source_bytes AS source_bytes,
              d.created_at AS created_at
       FROM deployments d JOIN projects p ON p.id = d.project_id
       WHERE p.slug = ? AND d.source_key IS NOT NULL
       ORDER BY d.created_at DESC`
    )
    .bind(slug)
    .all<SourceSnapshot>()
  return res.results ?? []
}
