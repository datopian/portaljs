---
metatitle: Deploy a PortalJS Portal – PortalJS Arc or Self-Hosted
metadescription: Publish your PortalJS portal with /portaljs-deploy to PortalJS Arc (managed hosting on Cloudflare, a live <slug>.arc.portaljs.com URL), or self-host the static export on Vercel, Netlify, Cloudflare, S3, or nginx.
title: Deploy
description: Publish to PortalJS Arc with /portaljs-deploy, or self-host the static export anywhere.
---

**Goal:** take the portal live. The fast path is [`/portaljs-deploy`](/docs/skills/portaljs-deploy) to
[**PortalJS Arc**](/docs/arc) — Datopian-managed hosting. Or self-host the static export on
any host you like.

## The AI path — `/portaljs-deploy` → PortalJS Arc

```
/portaljs-deploy
```

[`/portaljs-deploy`](/docs/skills/portaljs-deploy) builds a static export, uploads it to
[PortalJS Arc](/docs/arc), and prints a live `https://<slug>.arc.portaljs.com` URL. It
**never reports success on a failing build**, and re-running redeploys the same slug in
place.

No separate login step — the first `/portaljs-deploy` on a new machine signs you in on demand (one
browser click via GitHub), saves the token to `~/.portaljs/credentials`, and reuses it on
later deploys. For CI, set `PORTALJS_TOKEN` instead. See the
[`/portaljs-deploy` skill](/docs/skills/portaljs-deploy) for details.

> [!info] Static only (for now)
> Arc serves static exports. The catalog template, `/portaljs-add-dataset`, `/portaljs-migrate`, and
> `/portaljs-connect-ckan` (SSG) all export cleanly. A portal that relies on `getServerSideProps`
> (SSR) isn't hosted on Arc yet — self-host it (below).

## The self-host path

Arc is optional — a portal is a standard static Next.js export you can host anywhere. Set
`output: 'export'` and `images: { unoptimized: true }` in `next.config.js`, then build:

```bash
npm run build     # writes the static site to out/
npx serve out     # preview locally
```

Upload `out/` to any static host:

```bash
npx vercel --prod                        # Vercel
npx wrangler pages deploy out            # your own Cloudflare Pages
netlify deploy --dir=out --prod          # Netlify
npx gh-pages -d out                      # GitHub Pages
```

(For an SSR/CKAN portal that needs a server, deploy to Vercel with `npx vercel` instead of a
static export, and set env vars like `DMS` in the Vercel dashboard.)

## Notes

- **Dynamic routes under static export** need `getStaticPaths` returning
  `{ fallback: false }`. The [catalog template](/docs/templates) pre-renders every manifest
  entry, so `/portaljs-add-dataset` and `/portaljs-migrate` portals export cleanly.
- **Environment variables:** for static export, inline client-side values at build time with
  `NEXT_PUBLIC_*`; for a Vercel/SSR deploy, set them in the Vercel dashboard.
- **GitHub Pages subpath:** if deploying to `https://user.github.io/repo/`, also set
  `basePath` and `assetPrefix` in `next.config.js`.

## Where to go next

- **[PortalJS Arc](/docs/arc)** — how the managed hosting works.
- **[Theming](/docs/guides/theming)** — brand the portal before you ship it.

<DocsPagination prev="/docs/guides/connect-a-ckan-backend" next="/docs/guides/theming" />
