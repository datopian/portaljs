---
metatitle: /deploy – Publish a PortalJS Portal to Vercel or Static Hosting
metadescription: The /deploy skill detects your target, builds the portal, and publishes it to Vercel or any static host — never reporting success on a failing build, with a live URL at the end.
title: /deploy
description: Build and publish the portal to Vercel or any static host — with a live URL at the end.
---

`/deploy` takes a PortalJS portal live in one shot. It detects the target, builds,
verifies the build passes, and either publishes (Vercel) or produces a ready-to-
upload `out/` directory (static hosting). It never reports success on a failing
build.

## When to use it

Run it once the portal looks right locally. It's the last step in the typical flow
after [`/new-portal`](/docs/skills/new-portal),
[`/add-dataset`](/docs/skills/add-dataset), and any enrichment skills.

## Inputs

| Input | Required | Notes |
| ----- | -------- | ----- |
| Portal directory | No | Path to the portal project. Defaults to the current directory; must contain a Next.js `package.json`. |
| Target | No | `vercel` or `static`. If omitted, the skill auto-detects and tells you what it chose. |

**Two targets:**

- **`vercel`** — pushes to Vercel via the `vercel` CLI. Handles SSR/ISR natively
  and gives a live `*.vercel.app` URL (or your custom domain). Best default for
  portals that may grow server-side features. Requires the CLI installed and logged
  in (`vercel login`).
- **`static`** — builds a fully static site (`output: 'export'` → `out/`) suitable
  for any static host: GitHub Pages, Netlify, S3 + CloudFront, Cloudflare Pages, or
  plain nginx. No server required.

Auto-detection prefers Vercel if a `.vercel/` link exists, static if
`next.config.js` already sets `output: 'export'`, and otherwise Vercel when its CLI
is available (falling back to static).

## Example

```
/deploy
```

Force a target, or promote a preview to production:

```
/deploy --static
/deploy --prod
```

## What it produces

- **Vercel:** no files changed; a deployment is created and a live URL printed.

  ```
  ✓ Deployed to Vercel
    URL: https://auckland-council-open-data.vercel.app
  ```

- **Static:** `next.config.js` may be edited (to add `output: 'export'`,
  `images: { unoptimized: true }`, and a base path if needed); an `out/` directory
  of static HTML is produced. Nothing is uploaded unless you name a host.

  ```
  ✓ Static site built: out/  (12 pages)
    Preview locally: npx serve out
  ```

> CKAN or SSR portals that rely on `getServerSideProps` need a server — use the
> `vercel` target for those. Set env vars (e.g. `DMS`) in the Vercel dashboard
> before deploying.

## Where to go next

- **[Skills reference](/docs/skills)** — the full set of skills.
- **[`/connect-ckan`](/docs/skills/connect-ckan)** — point the portal at a live
  backend before deploying.

<DocsPagination prev="/docs/skills/connect-ckan" />
