#!/usr/bin/env node
//
// cloud/scripts/audit-user-emails.mjs — quantify (and where possible, backfill) the
// missing-email gap in the Arc users table. Bead po-rxf.
//
// Background: until po-rxf the GitHub OAuth callback asked only for the `read:user` scope and
// read the email off `GET /user`, which is populated ONLY for accounts with a PUBLIC profile
// email. Most accounts don't have one, so 6 of 8 production users ended up with a NULL
// `users.email` — 75% of the table with no contact address at all.
//
// The forward fix is in the worker: the callback now requests `user:email` and stores the
// primary VERIFIED address, so every affected user self-heals on their next sign-in. This
// script covers the users who don't come back soon:
//
//   1. It reports the gap (totals by auth provider) — the "quantified" half of the bead.
//   2. For GitHub users it looks up the PUBLIC profile email (GET /users/<login>), the only
//      address obtainable without that user's OAuth token — Arc stores no access tokens.
//   3. It PRINTS the UPDATE statements. It never writes. Review, then pipe them to wrangler
//      yourself (see below).
//
// Read-only by construction: the only D1 call it makes is a SELECT.
//
// Usage:
//   node cloud/scripts/audit-user-emails.mjs [--env production|staging] [--no-github]
//
// Requires: wrangler authenticated for the Cloudflare account (cloud/deploy.sh pins it).
// GITHUB_TOKEN is optional — without it the public-profile lookups use the unauthenticated
// rate limit (60/hour), which is plenty for a table this size.
//
// Applying the emitted SQL (after reviewing it):
//   node cloud/scripts/audit-user-emails.mjs --env production > /tmp/backfill.sql
//   wrangler d1 execute portaljs-arc --remote --env production --file /tmp/backfill.sql
//
// NOTE: `--env` is REQUIRED on the wrangler call or the database does not resolve (po-4nu).

import { execFileSync } from 'node:child_process'

const args = process.argv.slice(2)
const env = valueOf('--env') ?? 'production'
const useGitHub = !args.includes('--no-github')
const DB = env === 'production' ? 'portaljs-arc' : 'portaljs-arc-staging'

function valueOf(flag) {
  const i = args.indexOf(flag)
  return i >= 0 ? args[i + 1] : undefined
}

// The D1 read. `--json` makes wrangler emit a parseable envelope instead of a table.
function query(sql) {
  const out = execFileSync(
    'npx',
    ['wrangler', 'd1', 'execute', DB, '--remote', '--env', env, '--json', '--command', sql],
    { cwd: new URL('../api/', import.meta.url).pathname, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }
  )
  // wrangler prints a JSON array of result envelopes; tolerate a leading banner line.
  const parsed = JSON.parse(out.slice(out.indexOf('[')))
  return parsed[0]?.results ?? []
}

// GitHub's PUBLIC profile email — null unless the user chose to publish one. This is the only
// address reachable without the user's own OAuth token, so it is a partial backfill by
// definition; everyone else self-heals at next sign-in.
async function publicEmail(login) {
  const headers = { 'user-agent': 'portaljs-arc-audit', accept: 'application/vnd.github+json' }
  if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  const res = await fetch(`https://api.github.com/users/${encodeURIComponent(login)}`, { headers })
  if (!res.ok) return null
  const body = await res.json()
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : null
  // A no-reply address is undeliverable — worse than NULL, because it looks contactable.
  return email && !email.endsWith('@users.noreply.github.com') ? email : null
}

const sqlString = (s) => `'${String(s).replace(/'/g, "''")}'`

const users = query(
  'SELECT id, github_id, login, email, auth_provider, created_at FROM users ORDER BY created_at'
)
const missing = users.filter((u) => !u.email)
const gitHubMissing = missing.filter((u) => u.login)

const pct = (n) => (users.length ? Math.round((n / users.length) * 100) : 0)
const report = [
  `-- Arc users email audit (po-rxf) — db=${DB} env=${env}`,
  `-- users total:            ${users.length}`,
  `-- with an email:          ${users.length - missing.length}`,
  `-- MISSING an email:       ${missing.length} (${pct(missing.length)}%)`,
  `--   of those, GitHub:     ${gitHubMissing.length} (self-heal on next sign-in)`,
  `--   of those, other:      ${missing.length - gitHubMissing.length}`,
]

const claimed = new Set(users.map((u) => u.email).filter(Boolean))
const updates = []
if (useGitHub) {
  for (const u of gitHubMissing) {
    const email = await publicEmail(u.login)
    if (!email) {
      report.push(`--   @${u.login}: no public profile email — waits for next sign-in`)
      continue
    }
    if (claimed.has(email)) {
      // users.email is UNIQUE; another row already holds this address (see po-5ai).
      report.push(`--   @${u.login}: ${email} already belongs to another account — skipped`)
      continue
    }
    claimed.add(email)
    updates.push(
      `UPDATE users SET email = ${sqlString(email)}, auth_provider = COALESCE(auth_provider, 'github') WHERE id = ${sqlString(u.id)} AND email IS NULL;`
    )
  }
  report.push(`-- backfillable from public profiles: ${updates.length}`)
} else {
  report.push('-- (--no-github: profile lookups skipped, report only)')
}

// email_verified_at is deliberately NOT stamped by the backfill: a public profile email is
// self-declared, not proven verified the way the OAuth `user:email` lookup is.
console.log(report.join('\n'))
if (updates.length) console.log('\n' + updates.join('\n'))
