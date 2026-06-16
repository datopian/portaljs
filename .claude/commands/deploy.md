---
description: Deploy a PortalJS portal to PortalJS Arc — Datopian-managed static hosting on Cloudflare. Builds a static export, uploads it, and returns a live <slug>.arc.portaljs.com URL. One command, one target.
allowed-tools: Read, Write, Edit, Bash
---

# /deploy

Publish an existing PortalJS portal to **PortalJS Arc** — Datopian's managed static hosting.
The skill builds a static export of the portal, uploads it to the Arc API, and prints a live
`https://<slug>.arc.portaljs.com` URL. Re-running redeploys the same portal (idempotent on
the slug).

This is a **single-target** skill: it deploys to PortalJS Arc only. If you'd rather host the
portal yourself, it's a standard static Next.js export — run `npm run build` and upload `out/`
to any static host (Vercel, your own Cloudflare, Netlify, S3, …); you don't need this skill
for that.

> **Static only (for now).** Arc serves static exports — the catalog template, `/add-dataset`,
> `/migrate`, and `/connect-ckan` (SSG) all export cleanly. SSR isn't hosted on Arc yet.

## Required input — ask, don't error

- **Portal directory** (optional) — the portal project (default: current directory). Must be a
  Next.js portal (`package.json` with a `next` dependency).
- **Slug** (optional) — the subdomain to publish under (`<slug>.arc.portaljs.com`). Default:
  the project's `package.json` `name` (or the directory name), slugified. Override with
  `--slug <name>`.
- **Auth** — a PortalJS Arc token. Read from `PORTALJS_TOKEN`, else `~/.portaljs/credentials`
  (`{ "token": "…" }`). If neither is present, **stop and tell the user how to sign in** (see
  step 2) rather than failing cryptically.

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

### 2. Resolve the Arc token

```bash
TOKEN="${PORTALJS_TOKEN:-}"
[ -z "$TOKEN" ] && [ -f "$HOME/.portaljs/credentials" ] && TOKEN=$(node -e "try{process.stdout.write(require('$HOME/.portaljs/credentials').token||'')}catch{}" 2>/dev/null)
```
If `TOKEN` is empty, **do not proceed** — tell the user:
```
To deploy to PortalJS Arc you need a token. Sign in at https://arc.portaljs.com to get one,
then either:
  export PORTALJS_TOKEN=<token>
or save it to ~/.portaljs/credentials as {"token":"<token>"}.
Then re-run /deploy.
```
(The API base URL defaults to `https://api.arc.portaljs.com`; override with `PORTALJS_ARC_API`
for staging, e.g. the staging API worker URL.)

### 3. Build a static export

Ensure `PORTAL_DIR/next.config.js` enables static export — it must set
`output: 'export'` and `images: { unoptimized: true }` (the image optimizer needs a server).
If those are missing, add them (preserve the rest of the config), and tell the user you did.

```bash
cd PORTAL_DIR
npm run build > /tmp/arc-build.log 2>&1
BUILD_EXIT=$?
tail -30 /tmp/arc-build.log
```
If `BUILD_EXIT` is non-zero, print the log and fix the error before continuing — never deploy
a failing build. Confirm the export landed: `PORTAL_DIR/out/index.html` must exist.

> Static export pre-renders every page at build time. A CKAN/`getStaticPaths` portal must use
> `fallback: false` (the templates do). If the build complains about a dynamic route, that's
> the cause.

### 4. Package + upload

Tar the export (gzip; exclude macOS AppleDouble files) and POST it to the Arc API:

```bash
cd PORTAL_DIR
COPYFILE_DISABLE=1 tar czf /tmp/arc-deploy.tgz -C out .
API="${PORTALJS_ARC_API:-https://api.arc.portaljs.com}"
HTTP=$(curl -s -o /tmp/arc-resp.json -w "%{http_code}" -m 120 \
  -X POST "$API/v1/deploy?slug=SLUG" \
  -H "Authorization: Bearer $TOKEN" \
  --data-binary @/tmp/arc-deploy.tgz)
echo "HTTP $HTTP"; cat /tmp/arc-resp.json
```

Handle the response:
- **200** — parse `url` from the JSON; that's the live portal.
- **401** — token invalid/expired → tell the user to re-auth (step 2).
- **409** — the slug is taken by another account → ask for a different `--slug`.
- **400 / 413** — bad slug or upload too large → surface the JSON `error`.
- anything else — print the body and stop; don't claim success.

### 5. Report

```
✓ Deployed to PortalJS Arc
  - URL:   https://SLUG.arc.portaljs.com
  - Files: <n>   (<bytes> uploaded)
  - Slug:  SLUG  (re-run /deploy to update)

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
- **Custom domains / SSR.** Not in v1. Arc serves `*.arc.portaljs.com` static sites today.
