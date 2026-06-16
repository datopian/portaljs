-- PortalJS Arc — control-plane schema (D1). See cloud/SPEC.md.

CREATE TABLE IF NOT EXISTS users (
  id          TEXT PRIMARY KEY,
  github_id   INTEGER UNIQUE,
  login       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- API tokens are stored as a SHA-256 hex hash, never in clear text.
CREATE TABLE IF NOT EXISTS tokens (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hash        TEXT NOT NULL UNIQUE,
  label       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  revoked_at  TEXT
);

-- One row per portal; slug is the hostname label under arc.portaljs.com.
CREATE TABLE IF NOT EXISTS projects (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug        TEXT NOT NULL UNIQUE,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS deployments (
  id          TEXT PRIMARY KEY,
  project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status      TEXT NOT NULL,
  files       INTEGER NOT NULL DEFAULT 0,
  bytes       INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_deployments_project ON deployments(project_id);
