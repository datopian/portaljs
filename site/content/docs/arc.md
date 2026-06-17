---
metatitle: PortalJS Arc – Managed Hosting for PortalJS Portals
metadescription: PortalJS Arc is Datopian-managed static hosting on Cloudflare. Run /deploy to publish a PortalJS portal to a live <slug>.arc.portaljs.com URL — no infrastructure to run.
title: PortalJS Arc
description: Datopian-managed static hosting for PortalJS portals — /deploy to a live <slug>.arc.portaljs.com URL.
---

**PortalJS Arc** is managed hosting for PortalJS portals, run by Datopian on Cloudflare. You
build a portal, run [`/deploy`](/docs/skills/deploy), and it goes live at
`https://<slug>.arc.portaljs.com` — no servers, no infrastructure to set up.

> [!info] One command
> ```
> /deploy
> → builds a static export of your portal
> → uploads it to PortalJS Arc
> ✓ Live at https://my-portal.arc.portaljs.com
> ```

## How it works

A PortalJS portal static-exports to plain HTML/CSS/JS (the catalog template, `/add-dataset`,
`/migrate`, and `/connect-ckan` all pre-render with `getStaticPaths`). `/deploy` builds that
export and uploads it to Arc, which serves it from object storage behind Cloudflare's edge.
The deploy is **idempotent** — the slug is your portal's permanent address, and re-deploying
replaces the site in place.

## Auth

Sign in at [arc.portaljs.com](https://arc.portaljs.com) with GitHub and generate an API
token. `/deploy` reads it from `PORTALJS_TOKEN` or `~/.portaljs/credentials`; it's never
committed to your repo. See the [`/deploy` skill](/docs/skills/deploy) for the exact setup.

## Scope today

- **Static only.** Arc hosts static exports. A portal that relies on `getServerSideProps`
  (SSR) isn't on Arc yet.
- **`*.arc.portaljs.com` URLs.** Custom domains aren't available in this version.

## Self-hosting instead

Arc is optional. Because a portal is a standard static Next.js export, you can host it
yourself anywhere — run `npm run build` and upload the `out/` directory to Vercel, your own
Cloudflare, Netlify, S3, or any static host. `/deploy` simply automates the Arc path.

## Where to go next

- **[`/deploy`](/docs/skills/deploy)** — publish your portal.
- **[Backends](/docs/backends)** — connect a live data backend before deploying.

<DocsPagination prev="/docs/backends" next="/docs/skills/deploy" />
