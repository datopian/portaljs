---
description: Deploy a PortalJS portal to PortalJS Arc — Datopian-managed static hosting on Cloudflare. Builds a static export, uploads it, and returns a live <slug>.arc.portaljs.com URL. One command, one target.
allowed-tools: Read, Write, Edit, Bash
---

# /portaljs-deploy

Publish an existing PortalJS portal to **PortalJS Arc** — Datopian's managed static hosting.
The skill builds a static export of the portal, uploads it to the Arc API, and prints a live
`https://<slug>.arc.portaljs.com` URL. Re-running redeploys the same portal (idempotent on
the slug).

This is a **single-target** skill: it deploys to PortalJS Arc only. If you'd rather host the
portal yourself, it's a standard static Next.js export — run `npm run build` and upload `out/`
to any static host (Vercel, your own Cloudflare, Netlify, S3, …); you don't need this skill
for that.

> **Static only (for now).** Arc serves static exports — the catalog template, `/portaljs-add-dataset`,
> `/portaljs-migrate`, and `/portaljs-connect-ckan` (SSG) all export cleanly. SSR isn't hosted on Arc yet.

## Required input — ask, don't error

- **Portal directory** (optional) — the portal project (default: current directory). Must be a
  Next.js portal (`package.json` with a `next` dependency).
- **Slug** (optional) — the subdomain to publish under (`<slug>.arc.portaljs.com`). Default:
  the project's `package.json` `name` (or the directory name), slugified. Override with
  `--slug <name>`.
- **Auth** — a PortalJS Arc token. Read from `PORTALJS_TOKEN`, else `~/.portaljs/credentials`
  (`{ "token": "…" }`). If neither is present, **sign in on demand** (one browser click —
  device flow, see step 2) to obtain and store one, then continue. Auth is never a separate
  step the user runs; `/portaljs-deploy` handles it. Don't ask the user to copy a token by hand.

## Steps

### 1. Gather input + validate the portal

Extract from `$ARGUMENTS`:
- `PORTAL_DIR` (default `.`), `SLUG` (default from `package.json` name / dir, slugified to a
  DNS label: lowercase, `[a-z0-9-]`, ≤63 chars).

Confirm `PORTAL_DIR/package.json` exists and lists `next`. If not:
```
ERROR: [deploy] NOT_A_PORTAL No Next.js project in <dir> — run from a portal directory.
```
Reserved slugs (`www`, `api`, `admin`, `staging`, `arc`) are not allowed — if the derived slug
is reserved or invalid, ask for a `--slug`.

### 2. Resolve the Arc token (sign in on demand)

```bash
TOKEN="${PORTALJS_TOKEN:-}"
# Read the credentials file as JSON (never require() it — that executes it as JS
# and an extensionless file won't parse the documented {"token":"…"} shape).
if [ -z "$TOKEN" ] && [ -f "$HOME/.portaljs/credentials" ]; then
  TOKEN=$(node -e "const fs=require('fs');try{process.stdout.write(JSON.parse(fs.readFileSync(process.env.HOME+'/.portaljs/credentials','utf8')).token||'')}catch{}")
fi
```

If `TOKEN` is empty, **sign in inline** with the device-authorization flow (the `gh auth
login` / `wrangler login` model — one browser click, no token copying). Run the self-contained
Node script below (Node ≥18; uses global `fetch`): it requests a device code, opens the
browser, polls until you approve, then writes `~/.portaljs/credentials` (mode 0600). After it
succeeds, re-read `TOKEN` with the snippet above and continue.

```bash
AUTH="${PORTALJS_ARC_AUTH:-https://arc.portaljs.com}"
API="${PORTALJS_ARC_API:-https://api.arc.portaljs.com}"

cat > /tmp/arc-login.mjs <<'EOF'
import { writeFileSync, mkdirSync, chmodSync } from 'node:fs'
import { join } from 'node:path'
import { homedir, hostname } from 'node:os'
import { spawn } from 'node:child_process'

const AUTH = process.env.PORTALJS_ARC_AUTH || 'https://arc.portaljs.com'
const API = process.env.PORTALJS_ARC_API || 'https://api.arc.portaljs.com'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Best-effort browser open; harmless/no-op in headless/agent sessions.
function openBrowser(url) {
  const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'cmd' : 'xdg-open'
  const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url]
  try { spawn(cmd, args, { stdio: 'ignore', detached: true }).unref() } catch {}
}

async function main() {
  const start = await fetch(`${AUTH}/device/code`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ label: hostname() }),
  })
  if (!start.ok) throw new Error(`device/code failed: HTTP ${start.status}`)
  const { device_code, user_code, verification_uri, verification_uri_complete, interval, expires_in } = await start.json()

  console.log('\n  Opening your browser… sign in with GitHub, then click "Authorize this device".')
  console.log(`  Didn't get a browser? Open ${verification_uri} and enter: ${user_code}\n`)
  openBrowser(verification_uri_complete || verification_uri)

  const deadline = Date.now() + (expires_in || 900) * 1000
  let wait = (interval || 5) * 1000
  for (;;) {
    if (Date.now() > deadline) throw new Error('Timed out waiting for authorization. Re-run /portaljs-deploy.')
    await sleep(wait)
    const poll = await fetch(`${AUTH}/device/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ device_code }),
    })
    if (poll.status === 200) {
      const { token } = await poll.json()
      const dir = join(homedir(), '.portaljs')
      mkdirSync(dir, { recursive: true })
      const file = join(dir, 'credentials')
      writeFileSync(file, JSON.stringify({ token, api: API }) + '\n', { mode: 0o600 })
      chmodSync(file, 0o600)
      // Confirm + greet by login name.
      let who = ''
      try {
        const me = await fetch(`${API}/v1/whoami`, { headers: { authorization: `Bearer ${token}` } })
        if (me.ok) who = (await me.json()).login
      } catch {}
      console.log(`✓ Logged in${who ? ` as @${who}` : ''}. Credentials saved to ${file}`)
      return
    }
    if (poll.status === 428) continue // authorization_pending
    const body = await poll.json().catch(() => ({}))
    if (poll.status === 400 && body.error === 'expired_token') throw new Error('Code expired. Re-run /portaljs-deploy.')
    throw new Error(`Authorization failed: HTTP ${poll.status} ${body.error || ''}`)
  }
}
main().catch((e) => { console.error(`✖ ${e.message}`); process.exit(1) })
EOF

PORTALJS_ARC_AUTH="$AUTH" PORTALJS_ARC_API="$API" node /tmp/arc-login.mjs
rm -f /tmp/arc-login.mjs
```

After the flow completes, re-read `TOKEN` from `~/.portaljs/credentials` (snippet above) and
continue to step 3. Non-interactive/CI: skip the browser flow by setting `PORTALJS_TOKEN`
(mint a token in the dashboard at https://arc.portaljs.com) — it takes precedence over the
file. If the device flow can't run at all (no Node, fully offline), fall back to telling the
user:
```
To deploy to PortalJS Arc you need a token. Sign in at https://arc.portaljs.com and either:
  export PORTALJS_TOKEN=<token>
or save it to ~/.portaljs/credentials as {"token":"<token>"}.
Then re-run /portaljs-deploy.
```
(The API base URL defaults to `https://api.arc.portaljs.com`; override with `PORTALJS_ARC_API`
for staging. The auth worker defaults to `https://arc.portaljs.com`; override with
`PORTALJS_ARC_AUTH`.)

### 3. Build a static export

Ensure `PORTAL_DIR/next.config.js` enables static export — it must set
`output: 'export'` and `images: { unoptimized: true }` (the image optimizer needs a server).
If those are missing, add them (preserve the rest of the config), and tell the user you did.

Set shell variables to the values resolved in step 1, then build (these bash blocks are
self-contained — set the variables in each block, since shell state doesn't persist):

```bash
PORTAL_DIR="."          # ← the portal directory from step 1
cd "$PORTAL_DIR"
npm run build > /tmp/arc-build.log 2>&1
BUILD_EXIT=$?
tail -30 /tmp/arc-build.log
```
If `BUILD_EXIT` is non-zero, print the log and fix the error before continuing — never deploy
a failing build. Confirm the export landed: `PORTAL_DIR/out/index.html` must exist.

> Static export pre-renders every page at build time. A CKAN/`getStaticPaths` portal must use
> `fallback: false` (the templates do). If the build complains about a dynamic route, that's
> the cause.

**Large data stays in R2 — do not pull it into the export.** If the portal uses Git LFS for
data (`.lfsconfig` present, or `git lfs ls-files` returns entries — epic po-g9y), do **not**
run `git lfs pull` before building. The deployed portal serves large data straight from
Cloudflare R2: each big dataset's `resource.path` (or `file`) in `datasets.json` is an
**absolute R2 URL**, which `resourceUrl()` passes through unchanged, so the bytes are fetched
in the browser from R2 and never copied into `out/`. Pulling LFS bytes into the working tree
would inline them into the static export (bloat); leaving them as pointers would ship broken
130-byte stubs. Either way the next step catches it. A large dataset still referenced by a
*relative* `public/data/...` path is a misconfiguration for deploy — re-add it with
`/portaljs-add-dataset` (which writes the absolute R2 URL) or, for an OSS self-host without
R2, keep it genuinely inline (small).

> **Pushing new LFS data needs an LFS token, not the deploy token directly.** Deploy only
> reads pointers, so it never needs LFS credentials. When you *add* data (`/portaljs-add-dataset`),
> the same Arc token resolved in step 2 mints a scoped Git LFS token from
> `POST $PORTALJS_ARC_API/v1/repos/<slug>/lfs-token` (the arc-api issuer, po-g9y.13) — the RS256
> signer stays server-side as a Worker secret. See `/portaljs-add-dataset` → "Authenticate git-lfs".

### 4. Verify the export serves data from R2 (no bloat)

A deployed portal must carry **zero dataset bytes** — large data is served from R2, not the
export. Gate the upload on the export-hygiene check, which fails on (1) Git LFS pointer leaks
(an LFS-tracked file exported as its stub) and (2) data files at/over the size budget (bytes
that should live in R2). Framework chunks under `_next/` (incl. duckdb-wasm) are exempt.

```bash
PORTAL_DIR="."          # ← the portal directory from step 1
cd "$PORTAL_DIR"
# Prefer the portal's own script (template ships scripts/check-export.mjs); fall back to a
# direct node invocation if an older portal doesn't have the npm script wired.
if npm run | grep -q '^  check-export'; then
  npm run check-export
else
  node scripts/check-export.mjs out 2>/dev/null || true
fi
CHECK_EXIT=$?
```

If the check fails (non-zero), **stop — do not upload**. Surface its message: it names the
offending files and the fix (reference large data by its absolute R2 URL in `datasets.json`
via `/portaljs-add-dataset`; don't `git lfs pull` into the export). Re-run from step 3 once
fixed. If a flagged file is a legitimately large *app* asset (not data), raise the budget:
`MAX_FILE_MB=<n> npm run check-export`. Portals scaffolded before this check shipped won't
have the script — skip the gate (the `|| true` above) rather than blocking the deploy.

### 5. Package + upload

Tar the export (gzip; exclude macOS AppleDouble files) and POST it to the Arc API:

```bash
PORTAL_DIR="."          # ← portal directory (step 1)
SLUG="my-portal"        # ← validated slug (step 1)
API="${PORTALJS_ARC_API:-https://api.arc.portaljs.com}"

# Re-resolve the token (self-contained block; see step 2 for the missing-token path).
TOKEN="${PORTALJS_TOKEN:-}"
if [ -z "$TOKEN" ] && [ -f "$HOME/.portaljs/credentials" ]; then
  TOKEN=$(node -e "const fs=require('fs');try{process.stdout.write(JSON.parse(fs.readFileSync(process.env.HOME+'/.portaljs/credentials','utf8')).token||'')}catch{}")
fi
[ -z "$TOKEN" ] && { echo "No Arc token — see step 2."; exit 1; }

cd "$PORTAL_DIR"
COPYFILE_DISABLE=1 tar czf /tmp/arc-deploy.tgz -C out .

# Pass the bearer token via a 0600 curl config file, not argv — so it doesn't leak
# through the process list on shared/CI machines. Remove it right after.
HDR=$(mktemp); chmod 600 "$HDR"
printf 'header = "Authorization: Bearer %s"\n' "$TOKEN" > "$HDR"
HTTP=$(curl -s -o /tmp/arc-resp.json -w "%{http_code}" -m 120 -K "$HDR" \
  -X POST "$API/v1/deploy?slug=$SLUG" \
  --data-binary @/tmp/arc-deploy.tgz)
rm -f "$HDR"
echo "HTTP $HTTP"; cat /tmp/arc-resp.json
```

Handle the response:
- **200** — parse `url` from the JSON; that's the live portal.
- **401** — token invalid/expired/revoked → **re-run the device flow from step 2 once** to
  re-authenticate, then re-read the token and retry the upload a single time. If it 401s again,
  stop and surface the error (don't loop).
- **409** — the slug is taken by another account → ask for a different `--slug`.
- **400 / 413** — bad slug or upload too large → surface the JSON `error`.
- anything else — print the body and stop; don't claim success.

### 6. Report

```
✓ Deployed to PortalJS Arc
  - URL:   https://SLUG.arc.portaljs.com
  - Files: <n>   (<bytes> uploaded)
  - Data:  <k> dataset(s) served from R2, <m> inline   (from the step 4 check)
  - Slug:  SLUG  (re-run /portaljs-deploy to update)

Open the URL to view your live portal.
```

## Notes

- **Idempotent.** Deploying the same slug again replaces the site in place. Pick the slug once;
  it's your portal's permanent address.
- **Auth lives outside the repo.** The token is read from `PORTALJS_TOKEN` or
  `~/.portaljs/credentials` — never commit it. `https://arc.portaljs.com` is where you sign in
  and manage tokens.
- **Self-hosting.** Arc is optional. The build output in `out/` is a plain static site you can
  host anywhere; this skill just automates the Arc path.
- **Large data serves from R2 (epic po-g9y).** The static export ships no dataset bytes — big
  data is fetched in the browser from Cloudflare R2 via the absolute URLs in `datasets.json`
  (`resourceUrl()` passthrough). Deploy never pulls LFS bytes into the export, and step 4 gates
  the upload on an export-hygiene check (no LFS pointer leaks, no oversized files). Set large
  datasets up with `/portaljs-add-dataset`; the bundled `public/data/` sample stays inline.
- **Custom domains / SSR.** Not in v1. Arc serves `*.arc.portaljs.com` static sites today.
