// GitHub identity lookups for the OAuth callback (po-rxf).
//
// Why this module exists: `GET /user` only returns an email when the account has a PUBLIC
// profile email. Most people don't — which is how 6 of 8 production users ended up with a
// NULL `users.email`. The address we actually want is the account's PRIMARY VERIFIED email,
// and that only comes from `GET /user/emails`, which requires the `user:email` scope.
//
// Rules encoded here:
//   - Only ever return a VERIFIED address. An unverified one is an unowned address and must
//     never be persisted or emailed.
//   - Prefer the primary; otherwise the first verified one.
//   - Skip GitHub's `@users.noreply.github.com` no-reply addresses — they are undeliverable
//     for anything we'd actually send, so storing one is worse than storing NULL (it looks
//     like contactable data and isn't).
//   - NEVER throw. A failed/misscoped email lookup degrades to `null`: sign-in still works,
//     the row just keeps a NULL email until the next login.

import { normalizeEmail } from './email'

const API = 'https://api.github.com'

export interface GitHubUser {
  id: number
  login: string
}

interface GitHubEmail {
  email?: string
  primary?: boolean
  verified?: boolean
}

function apiHeaders(accessToken: string): Record<string, string> {
  return {
    authorization: `Bearer ${accessToken}`,
    'user-agent': 'portaljs-arc',
    accept: 'application/vnd.github+json',
  }
}

// Identify the signed-in account. Returns null on any non-2xx / malformed payload so the
// caller can fail the callback with a 502 (unchanged behaviour, just moved here).
export async function fetchGitHubUser(accessToken: string): Promise<GitHubUser | null> {
  try {
    const res = await fetch(`${API}/user`, { headers: apiHeaders(accessToken) })
    if (!res.ok) return null
    const body = (await res.json()) as { id?: number; login?: string }
    if (!body.id || !body.login) return null
    return { id: body.id, login: body.login }
  } catch {
    return null
  }
}

// A GitHub no-reply address (`12345+login@users.noreply.github.com`) is deliverable only
// inside GitHub's own mail flow — useless as a contact address, so we treat it as absent.
export function isNoReplyEmail(email: string): boolean {
  return email.endsWith('@users.noreply.github.com')
}

// Pick the best address out of a /user/emails payload: primary+verified, else the first
// verified. Exported for tests — and because the selection rule is the interesting part.
export function pickVerifiedEmail(emails: unknown): string | null {
  if (!Array.isArray(emails)) return null
  const usable = (emails as GitHubEmail[]).filter(
    (e) => typeof e?.email === 'string' && e.verified === true && !isNoReplyEmail(e.email as string)
  )
  const chosen = usable.find((e) => e.primary === true) ?? usable[0]
  return chosen?.email ? normalizeEmail(chosen.email) : null
}

// Fetch the account's primary verified email. Requires the `user:email` scope (requested at
// /auth/login); without it GitHub answers 403 and we return null rather than failing sign-in.
export async function fetchVerifiedEmail(accessToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${API}/user/emails`, { headers: apiHeaders(accessToken) })
    if (!res.ok) return null
    return pickVerifiedEmail(await res.json())
  } catch {
    return null
  }
}
