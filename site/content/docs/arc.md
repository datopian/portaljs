---
metatitle: PortalJS Arc – Managed Hosting for PortalJS Portals
metadescription: PortalJS Arc is Datopian-managed static hosting on Cloudflare. Run /portaljs-deploy to publish a PortalJS portal to a live <slug>.arc.portaljs.com URL — no infrastructure to run.
title: PortalJS Arc
description: Datopian-managed static hosting for PortalJS portals — /portaljs-deploy to a live <slug>.arc.portaljs.com URL.
---

**PortalJS Arc** is managed hosting for PortalJS portals, run by Datopian on Cloudflare. You
build a portal, run [`/portaljs-deploy`](/docs/skills/portaljs-deploy), and it goes live at
`https://<slug>.arc.portaljs.com` — no servers, no infrastructure to set up.

> [!info] One command
> ```
> /portaljs-deploy
> → builds a static export of your portal
> → uploads it to PortalJS Arc
> ✓ Live at https://my-portal.arc.portaljs.com
> ```

## How it works

A PortalJS portal static-exports to plain HTML/CSS/JS (the catalog template, `/portaljs-add-dataset`,
`/portaljs-migrate`, and `/portaljs-connect-ckan` all pre-render with `getStaticPaths`). `/portaljs-deploy` builds that
export and uploads it to Arc, which serves it from object storage behind Cloudflare's edge.
The deploy is **idempotent** — the slug is your portal's permanent address, and re-deploying
replaces the site in place.

## Auth

Auth is on demand — `/portaljs-deploy` handles it, there's no separate login step. The first deploy on
a new machine opens your browser for a one-click GitHub authorization (a device-authorization
flow), then saves the token to `~/.portaljs/credentials` and reuses it on later deploys. For CI,
set `PORTALJS_TOKEN` instead (mint a token at [arc.portaljs.com](https://arc.portaljs.com)). The
token is never committed to your repo. See the [`/portaljs-deploy` skill](/docs/skills/portaljs-deploy) for the
exact flow.

## Scope today

- **Static only.** Arc hosts static exports. A portal that relies on `getServerSideProps`
  (SSR) isn't on Arc yet.
- **`*.arc.portaljs.com` URLs.** Custom domains aren't available in this version.

## Self-hosting instead

Arc is optional. Because a portal is a standard static Next.js export, you can host it
yourself anywhere — run `npm run build` and upload the `out/` directory to Vercel, your own
Cloudflare, Netlify, S3, or any static host. `/portaljs-deploy` simply automates the Arc path.

## Where to go next

- **[`/portaljs-deploy`](/docs/skills/portaljs-deploy)** — publish your portal.
- **[Backends](/docs/backends)** — connect a live data backend before deploying.

<DocsPagination prev="/docs/backends" next="/docs/skills/portaljs-deploy" />
