-- PortalJS Arc — passwordless email auth (po-e6j). Adds email as a first-class sign-in
-- provider ALONGSIDE GitHub OAuth, writing to the SAME users table so Arc stays one
-- identity system. The auth worker + deploy API share this D1.

-- github_id is already nullable (0001_init.sql declares it `INTEGER UNIQUE`, no NOT NULL),
-- so an email-only user simply leaves it NULL. Add the email-provider columns:
ALTER TABLE users ADD COLUMN email             TEXT;
ALTER TABLE users ADD COLUMN auth_provider     TEXT; -- 'github' | 'email' (NULL = legacy github)
ALTER TABLE users ADD COLUMN full_name         TEXT;
ALTER TABLE users ADD COLUMN org               TEXT;
ALTER TABLE users ADD COLUMN email_verified_at TEXT;

-- One account per email. SQLite treats multiple NULLs as distinct, so this UNIQUE index
-- constrains only real email addresses and leaves every GitHub-only row (email NULL) free.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Pending magic-link sign-ins. Mirrors device_codes: the clear token lives only in the
-- emailed link; we store its SHA-256 hash. pending → claimed (consumed exactly once).
CREATE TABLE IF NOT EXISTS email_logins (
  id           TEXT PRIMARY KEY,
  -- SHA-256 of the opaque token embedded in the magic link (never stored in clear).
  token_hash   TEXT NOT NULL UNIQUE,
  -- The address the link was sent to; becomes users.email on verify.
  email        TEXT NOT NULL,
  -- Optional profile captured at sign-up (e.g. from the /build flow), copied to the user.
  full_name    TEXT,
  org          TEXT,
  -- Local post-verify redirect target (open-redirect-guarded at consume time).
  return_path  TEXT,
  -- pending → claimed (session issued exactly once, then terminal).
  status       TEXT NOT NULL DEFAULT 'pending',
  created_at   INTEGER NOT NULL, -- epoch seconds
  expires_at   INTEGER NOT NULL  -- epoch seconds
);

CREATE INDEX IF NOT EXISTS idx_email_logins_email ON email_logins(email);
