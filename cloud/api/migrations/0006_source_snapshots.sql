-- Source-snapshot storage for /v1/deploy (po-ce7) — an R2-backed workaround for
-- Cloudflare Artifacts (po-68u), which is closed-beta and not yet enrolled on our
-- account. Reuses the existing deployments/users rows for linkage and attribution
-- instead of a new table: a deployment already links project_id -> slug and, via
-- projects.user_id, an owner. Adding source_key/source_bytes here makes each
-- deployment optionally carry a pointer to its immutable pre-build source tarball.

ALTER TABLE deployments ADD COLUMN source_key TEXT;
ALTER TABLE deployments ADD COLUMN source_bytes INTEGER;

CREATE INDEX IF NOT EXISTS idx_deployments_source_key ON deployments(source_key);

-- Datopian staff who may retrieve ANY tenant's source snapshots (not just their own).
-- Minimal reuse of the existing users/tokens auth model — no new auth infrastructure.
-- Grant with: UPDATE users SET is_staff = 1 WHERE login = '<github-login>';
ALTER TABLE users ADD COLUMN is_staff INTEGER NOT NULL DEFAULT 0;
