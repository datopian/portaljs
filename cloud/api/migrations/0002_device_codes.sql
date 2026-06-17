-- PortalJS Arc — device-authorization flow (po-j57). Lets the CLI/`/deploy` skill
-- mint a token via a one-click browser approval (the gh/wrangler model) instead of the
-- copy-paste-token dance. The auth worker + deploy API share this D1.

CREATE TABLE IF NOT EXISTS device_codes (
  id           TEXT PRIMARY KEY,
  -- SHA-256 of the long opaque secret the CLI polls with (never stored in clear,
  -- matching the tokens table). The clear `device_code` lives only in the CLI.
  device_hash  TEXT NOT NULL UNIQUE,
  -- Short human-typed code shown in the terminal and entered in the browser.
  user_code    TEXT NOT NULL UNIQUE,
  -- Set when a signed-in user approves the request.
  user_id      TEXT REFERENCES users(id) ON DELETE CASCADE,
  -- Optional CLI-supplied hint (e.g. hostname) folded into the issued token's label.
  label        TEXT,
  -- pending → approved → claimed (token issued exactly once, then terminal).
  status       TEXT NOT NULL DEFAULT 'pending',
  created_at   INTEGER NOT NULL, -- epoch seconds
  expires_at   INTEGER NOT NULL  -- epoch seconds
);

CREATE INDEX IF NOT EXISTS idx_device_codes_user_code ON device_codes(user_code);
