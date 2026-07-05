-- Server-side signup-completion analytics (po-zbx). The /build sign-up funnel is captured
-- client-side by posthog-js up to build_email_sent (magic link REQUESTED). The COMPLETION —
-- link clicked → /email/verify → users row created — happens in the auth Worker, where the
-- browser SDK can't fire an event. To make the server 'arc_signup_completed' land on the SAME
-- PostHog person as the client events (so the funnel joins), the client's anonymous distinct-id
-- is passed through /email/start and stashed on the pending magic-link row until verify time.
ALTER TABLE email_logins ADD COLUMN ph_distinct_id TEXT;
