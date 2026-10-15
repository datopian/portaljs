-- Calls booked through the PortalJS Google appointment schedule (da-55j.2).
--
-- The booking itself happens on calendar.google.com, where the site cannot see it. Twenty's
-- Google Calendar sync already copies every booking into the CRM as a calendarEvent; the
-- auth worker's cron (cloud/auth/src/bookings.ts) reads those and sends `call_booked` /
-- `call_cancelled` to PostHog. This table is that sync's memory: one row per booking already
-- sent, so a rerun never double-counts and a later cancellation is reported exactly once.

CREATE TABLE IF NOT EXISTS booked_calls (
  calendar_event_id TEXT PRIMARY KEY, -- Twenty calendarEvent id
  schedule TEXT NOT NULL,             -- appointment schedule name, e.g. "PortalJS meetings"
  distinct_id TEXT NOT NULL,          -- PostHog distinct id the events were sent under (booker email)
  booked_at TEXT NOT NULL,            -- ISO time the booking was made (calendar event created)
  starts_at TEXT,                     -- ISO time the call is scheduled for
  captured_at INTEGER NOT NULL,       -- unix seconds call_booked was sent
  cancelled_at INTEGER                -- unix seconds call_cancelled was sent, NULL while live
);
