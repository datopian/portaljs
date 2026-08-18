// PortalJS Arc → Twenty CRM provenance pipe (po-jdr phase 1, parameterised in po-k6n phase 2).
//
// On a completed signup (GitHub OAuth, email magic-link, or CLI device-flow — the last two
// share the GitHub OAuth callback, see index.ts) upsert a Twenty `person` tagged with the
// `source` the caller passes in, so the CRM can attribute a contact to the surface that
// brought them in. The six values live on the Twenty `source` field itself (verified via the
// field metadata, not guessed): PORTALJS_BUILD, PORTALJS_DEMO, PORTALJS_CLOUD,
// PORTALJS_NEWSLETTER, PORTALJS_CLI, STAGING_TEST.
//
// NEVER throws and NEVER blocks the caller — a CRM failure must degrade exactly like the
// GitHub email lookup does (github.ts): sign-in succeeds regardless, the write is just
// logged as having failed (constraint: failures must be VISIBLE, not swallowed silently).
//
// CRM_ENABLED is the boundary, not the token. Both envs point at the SAME Twenty workspace
// (staging and production share one CRM), so a leaked/shared TWENTY_API_TOKEN gives no
// separation on its own. CRM_ENABLED is checked here, inside upsertCrmSignup, on every call —
// not once at Worker startup — so a mid-life config change takes effect immediately. Staging
// runs with it unset (off): the whole match/build path still executes, and the request that
// would have been sent is logged instead of fired, so the code path is exercised end-to-end
// without ever writing to the shared workspace from a non-production env.
//
// IDEMPOTENCY: a retry, replay, or repeat sign-in must not create a duplicate contact.
//   - email present (always true for the magic-link path; true for GitHub when the account
//     granted user:email) → look up by emails.primaryEmail, PATCH if found, POST if not.
//   - email absent (GitHub signup without a usable verified address) → Twenty's person object
//     has no generic external-id field to key on, so the fallback match is name.firstName ==
//     login AND source == <the same source the write itself uses> — the exact shape this pipe
//     always creates such rows with. Keying on source (not just login) matters now that more
//     than one surface writes here: a GitHub login is shared across surfaces (the same user can
//     sign in from /build and from the CLI), so without the source in the match key a CLI
//     sign-in could overwrite a /build row's source instead of creating its own. This is a
//     best-effort key, not a hard constraint: a human later editing that row's name in the CRM
//     would break the match on the next login and a second row would be created. Accepted per
//     the bead's own call — an uncontactable-but-present row beats withholding it — and the
//     same row is never silently overwritten by a stranger's rename.

export interface CrmEnv {
  TWENTY_API_TOKEN?: string
  CRM_ENABLED?: string
}

// The Twenty `source` field's option values (read from field metadata, not guessed — po-k6n).
export type CrmSource =
  | 'PORTALJS_BUILD'
  | 'PORTALJS_DEMO'
  | 'PORTALJS_CLOUD'
  | 'PORTALJS_NEWSLETTER'
  | 'PORTALJS_CLI'
  | 'STAGING_TEST'

export interface CrmSignup {
  email?: string | null
  // GitHub login — fallback match key used only when email is absent.
  login?: string | null
  // Which surface produced this signup (po-k6n). Required: an unparameterised default would
  // silently mislabel every surface but the first one built.
  source: CrmSource
}

const CRM_BASE = 'https://crm.datopian.com/rest'

function crmHeaders(token: string): Record<string, string> {
  return { authorization: `Bearer ${token}`, 'content-type': 'application/json' }
}

interface PeopleListResponse {
  data?: { people?: Array<{ id: string }> }
}

async function findPersonId(headers: Record<string, string>, filter: string): Promise<string | null> {
  const res = await fetch(`${CRM_BASE}/people?filter=${encodeURIComponent(filter)}&limit=1`, { headers })
  if (!res.ok) throw new Error(`crm lookup failed: ${res.status}`)
  const body = (await res.json()) as PeopleListResponse
  return body.data?.people?.[0]?.id ?? null
}

// Fire from ctx.waitUntil. Never throws — every failure mode (missing config, network error,
// non-2xx response) is caught and logged, never propagated to the signup response.
export async function upsertCrmSignup(env: CrmEnv, signup: CrmSignup): Promise<void> {
  const email = signup.email?.trim() || undefined
  const login = signup.login?.trim() || undefined
  if (!email && !login) {
    console.error('crm write skipped: neither email nor github login present')
    return
  }

  const filter = email
    ? `emails.primaryEmail[eq]:"${email}"`
    : `and(name.firstName[eq]:"${login}",source[eq]:"${signup.source}")`
  const payload = email
    ? { emails: { primaryEmail: email }, source: signup.source }
    : { name: { firstName: login, lastName: '' }, source: signup.source }

  if (env.CRM_ENABLED !== 'true') {
    console.log('crm write skipped (CRM_ENABLED off)', JSON.stringify({ filter, payload }))
    return
  }
  const token = env.TWENTY_API_TOKEN
  if (!token) {
    console.error('crm write failed: TWENTY_API_TOKEN not set')
    return
  }

  try {
    const headers = crmHeaders(token)
    const personId = await findPersonId(headers, filter)
    const url = personId ? `${CRM_BASE}/people/${personId}` : `${CRM_BASE}/people`
    const res = await fetch(url, { method: personId ? 'PATCH' : 'POST', headers, body: JSON.stringify(payload) })
    if (!res.ok) {
      console.error('crm write failed', res.status, await res.text().catch(() => '<no body>'))
    }
  } catch (err) {
    console.error('crm write threw', err instanceof Error ? err.message : String(err))
  }
}
