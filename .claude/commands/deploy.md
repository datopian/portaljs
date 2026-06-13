---
description: One-shot deploy of a PortalJS portal to Cloudflare Pages (recommended), Vercel, or any static host. Detects the target, builds, and publishes — with a live URL at the end.
allowed-tools: Read, Write, Edit, Bash
---

# /deploy

Deploy an existing PortalJS portal in one shot. Two targets:

- **`vercel`** — push to Vercel via the `vercel` CLI. Handles SSR/ISR natively, gives a live `*.vercel.app` URL (or your custom domain). Zero-config if the user already has the Vercel CLI, so the skill may auto-detect it.
- **`static`** — build a fully static site (`next export` → `out/`) for any static host: **Cloudflare Pages** (`npx wrangler pages deploy out`), GitHub Pages, Netlify, S3 + CloudFront, plain nginx. No server required.

> **Recommended host: Cloudflare Pages** (the `static` target). PortalJS's architecture docs default to a static-first, S3-compatible, no-lock-in stack on Cloudflare (Pages for static; Workers for the opt-in runtime). Vercel is offered as a convenient SSR option, not the recommended production default — if the skill auto-detects Vercel (because the CLI is installed) it will say so before proceeding, and you can choose `static` + Cloudflare instead. A first-class managed/bring-your-own Cloudflare deploy flow is on the roadmap.

This skill builds, verifies the build passes, and either publishes (Vercel) or produces a ready-to-upload `out/` directory (static). It never reports success on a failing build.

## Required input

- **Portal directory** — path to the portal project (default: current directory). Must contain a `package.json` with a `next` dependency.
- **Target** — `vercel` or `static`. If omitted, the skill auto-detects (see Step 2) and tells you what it chose before proceeding.

If the directory is not a PortalJS / Next.js project:
```
ERROR: [deploy] NOT_A_PORTAL No Next.js project found in <dir> — run from a portal directory (one containing package.json with a "next" dependency).
```

## Steps

### 1. Parse arguments from `$ARGUMENTS`

Extract:
- `PORTAL_DIR` — portal directory (default: `.`)
- `TARGET` — `vercel` | `static` (default: auto-detect)
- `PROD` — whether this is a production deploy (default: `true` for Vercel; static is always a build)

Verify the portal:
```bash
cd "$PORTAL_DIR"
if [ ! -f package.json ] || ! grep -q '"next"' package.json; then
  echo "ERROR: [deploy] NOT_A_PORTAL No Next.js project found in $PORTAL_DIR — run from a portal directory."
  exit 1
fi
```

### 2. Determine the target

If `TARGET` was given, use it. Otherwise auto-detect, in this order:

1. If a `.vercel/` directory or `vercel.json` exists → **vercel** (already linked).
2. If `next.config.js` already sets `output: 'export'` → **static**.
3. Otherwise default to **vercel** if the `vercel` CLI is installed and authenticated; else **static**.

Always announce the choice before continuing:
```
Target: vercel (auto-detected — .vercel/ project link found)
```

### 3. Install dependencies if needed

```bash
[ -d node_modules ] || npm install
```

If `npm install` fails:
```
ERROR: [deploy] INSTALL_FAILED npm install failed — check Node.js >=18 and network access, then retry.
```

---

## Target A — Vercel

### A1. Check the CLI is installed and authenticated

```bash
if ! command -v vercel >/dev/null 2>&1; then
  echo "ERROR: [deploy] VERCEL_CLI_MISSING vercel CLI not found — install it with: npm i -g vercel"
  exit 1
fi
vercel whoami >/dev/null 2>&1 || {
  echo "ERROR: [deploy] VERCEL_AUTH Not logged in to Vercel — run: vercel login  (then retry /deploy)"
  exit 1
}
```

Do not attempt an interactive `vercel login` from inside the skill — it requires the user's terminal. Stop and tell the user to run it, then re-run `/deploy`.

### A2. Deploy

Vercel builds the Next.js app on its own infrastructure, so no local `next build` is required. Run a non-interactive deploy:

```bash
# --yes accepts project-link defaults on first deploy (no prompts)
if [ "$PROD" = "true" ]; then
  vercel deploy --prod --yes > /tmp/deploy-vercel.log 2>&1
else
  vercel deploy --yes > /tmp/deploy-vercel.log 2>&1
fi
DEPLOY_EXIT=$?
tail -30 /tmp/deploy-vercel.log
```

If `DEPLOY_EXIT` is non-zero, print the full log and stop:
```
ERROR: [deploy] VERCEL_DEPLOY_FAILED vercel deploy exited <code> — see log above for the failing step.
```

### A3. Report the live URL

The deployment URL is the last line of stdout from the Vercel CLI. Extract and present it:
```
✓ Deployed to Vercel
  URL: https://<project>-<hash>.vercel.app
  Inspect: <inspect URL from log>
```

If this was a preview (non-prod) deploy, remind the user:
```
This was a PREVIEW deploy. Promote to production with: /deploy --prod  (or `vercel deploy --prod`)
```

---

## Target B — Static export

A PortalJS template portal is fully client-rendered (the `Table` component fetches CSVs in the browser), so it exports cleanly to static HTML. Dynamic routes are only safe if every page is pre-rendered — see B4.

### B1. Enable static export in `next.config.js`

Read the current config. Ensure it contains `output: 'export'` and `images: { unoptimized: true }` (Next's image optimizer needs a server; static export requires it disabled).

If missing, edit `next.config.js` to add them. Target shape:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  output: 'export',
  images: { unoptimized: true },
}
module.exports = nextConfig
```

If the portal sets a non-root base path (deploying to `https://user.github.io/repo/`), also add `basePath: '/repo'` and `assetPrefix: '/repo/'`. Ask the user for the repo path only if they named GitHub Pages as the host; otherwise assume root.

### B2. Build

```bash
npm run build > /tmp/deploy-build.log 2>&1
BUILD_EXIT=$?
tail -30 /tmp/deploy-build.log
```

With `output: 'export'`, Next 14 writes the static site to `out/` as part of `next build` (no separate `next export` step). If `BUILD_EXIT` is non-zero, print the full log and stop:
```
ERROR: [deploy] BUILD_FAILED next build exited <code> — see log above. Common cause: a dynamic route without getStaticPaths (see notes).
```

### B3. Verify `out/`

```bash
[ -d out ] && [ -f out/index.html ] || {
  echo "ERROR: [deploy] EXPORT_EMPTY out/ not produced — confirm output: 'export' is set in next.config.js."
  exit 1
}
```

### B4. Handle dynamic routes (if present)

If `pages/` contains a dynamic route like `[slug].tsx`, static export requires `getStaticPaths` returning `{ fallback: false }`. If the build failed with a `getStaticPaths` error, this is why. PortalJS's `/add-dataset` skill writes one file per dataset specifically to avoid this — prefer that pattern. Report the offending route and stop rather than guessing paths.

### B5. Publish (optional) or report

By default, stop after producing `out/` and report how to upload. Only publish automatically if the user named a host:

- **GitHub Pages** (user asked for it and the repo has a remote):
  ```bash
  npx gh-pages -d out -t true > /tmp/deploy-ghpages.log 2>&1 || {
    echo "ERROR: [deploy] GHPAGES_FAILED gh-pages publish failed — see log; ensure the repo has a GitHub remote and push access."
    exit 1
  }
  ```
- **Netlify / Cloudflare Pages / S3:** do not run third-party CLIs unprompted. Report the `out/` path and the one-line command for their host.

Report:
```
✓ Static site built: out/  (<N> pages)
  Preview locally: npx serve out
  Upload out/ to any static host. Examples:
    - GitHub Pages:   npx gh-pages -d out
    - Netlify:        netlify deploy --dir=out --prod
    - Cloudflare:     npx wrangler pages deploy out
```

---

## Output expectations

- **Vercel:** no files changed; a deployment is created; a live URL is printed.
- **Static:** `next.config.js` may be edited (adds `output`/`images`/`basePath`); an `out/` directory is created; nothing is uploaded unless a host was named.
- On any failure, an `ERROR: [deploy] …` block is printed and the skill stops — never a success message over a failing build or deploy.

## Notes

- **First Vercel deploy** prompts to link a project; `--yes` accepts the defaults (project name = directory name, current dir as root). To control these, the user can run `vercel link` once beforehand.
- **Environment variables** (e.g. `DMS` for CKAN portals): set them in the Vercel dashboard or with `vercel env add` before deploying — they are not read from a local `.env` by the build on Vercel. For static export, client-side env vars must be inlined at build time via `NEXT_PUBLIC_*`.
- **CKAN / SSR portals cannot use `static`** if they rely on API routes or `getServerSideProps` — those need a server. Use `vercel` for them.
- **`out/` is build output** — add it to `.gitignore` if not already there; do not commit it.

Next: after a Vercel preview deploy, run `/deploy --prod` to promote to production.
