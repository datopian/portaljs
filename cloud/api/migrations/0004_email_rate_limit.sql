-- PortalJS Arc — rate-limit magic-link sends (po-jwn). Now that email auth is live
-- (po-e6j), POST /email/start is an open, unauthenticated send trigger: without a cap an
-- attacker can email-bomb a victim's inbox with sign-in links and burn Resend send quota.
-- One append-only row per ACCEPTED send; a sliding-window COUNT over it gates further sends
-- by BOTH recipient address and source IP. The auth worker owns this table (shares the D1
-- with the deploy API, same as email_logins / device_codes).

CREATE TABLE IF NOT EXISTS email_send_log (
  id         TEXT PRIMARY KEY,
  -- Normalized recipient the magic link was sent to (rate key #1: per-email cap).
  email      TEXT NOT NULL,
  -- Best-effort source IP from CF-Connecting-IP (rate key #2: per-IP cap); '' when unknown.
  ip         TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL -- epoch seconds
);

-- Composite indexes matching the two sliding-window COUNT queries (WHERE key AND created_at).
CREATE INDEX IF NOT EXISTS idx_email_send_log_email ON email_send_log(email, created_at);
CREATE INDEX IF NOT EXISTS idx_email_send_log_ip ON email_send_log(ip, created_at);
