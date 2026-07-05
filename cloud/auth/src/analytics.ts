// Server-side PostHog capture (po-zbx). posthog-js on the marketing site can only see the
// signup being STARTED (build_email_sent = magic link REQUESTED). The signup COMPLETING —
// the user clicking the link and a users row being created — happens here in the Worker,
// server-side, where a browser SDK can't reach. This module fires that completion event
// straight to PostHog's HTTP ingestion API (no SDK, Worker-native fetch).
//
// Design:
//   - No-op unless POSTHOG_KEY is set, so dev/test and unconfigured deploys stay silent.
//   - NEVER throws and NEVER blocks the caller — auth must succeed even if analytics is down.
//   - Distinct-id is reconciled with the client's anonymous id where we have it (passed
//     through the magic link via email_logins.ph_distinct_id), so the server 'arc_signup_completed'
//     lands on the SAME PostHog person as the client 'build_email_sent' and the funnel joins.
//     When we don't (GitHub OAuth, or a JS-bypassed POST), we fall back to the new user id.

export interface AnalyticsEnv {
  // Public PostHog project key (phc_…) — same value the site exposes client-side, safe to
  // ship as a var. Empty/unset ⇒ capture is a no-op.
  POSTHOG_KEY?: string
  // Ingestion host, e.g. https://eu.i.posthog.com. Defaults to the EU cloud host.
  POSTHOG_HOST?: string
}

const DEFAULT_HOST = 'https://eu.i.posthog.com'

export interface CaptureArgs {
  event: string
  distinctId: string
  properties?: Record<string, unknown>
  // ISO-8601 event time. Passed in (not read from the clock) to mirror the rest of the
  // codebase's testable-time convention.
  timestamp?: string
}

// Fire a single event at PostHog's /capture/ endpoint. Returns true if the request was
// accepted (2xx), false on any skip/failure — callers ignore the result; it exists for tests.
export async function captureServerEvent(env: AnalyticsEnv, args: CaptureArgs): Promise<boolean> {
  const key = env.POSTHOG_KEY
  if (!key || !args.distinctId) return false // unconfigured, or no identity to attribute to
  const host = (env.POSTHOG_HOST || DEFAULT_HOST).replace(/\/+$/, '')
  try {
    const res = await fetch(`${host}/capture/`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        api_key: key,
        event: args.event,
        distinct_id: args.distinctId,
        properties: { ...(args.properties ?? {}), $lib: 'arc-auth-worker' },
        timestamp: args.timestamp,
      }),
    })
    return res.ok
  } catch {
    // Analytics is best-effort — swallow network/DNS errors so sign-in never fails on them.
    return false
  }
}
