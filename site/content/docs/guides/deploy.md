---
metatitle: Deploy a PortalJS Portal – PortalJS Arc or Self-Hosted
metadescription: Publish your PortalJS portal with /deploy to PortalJS Arc (managed hosting on Cloudflare, a live <slug>.arc.portaljs.com URL), or self-host the static export on Vercel, Netlify, Cloudflare, S3, or nginx.
title: Deploy
description: Publish to PortalJS Arc with /deploy, or self-host the static export anywhere.
---

**Goal:** take the portal live. The fast path is [`/deploy`](/docs/skills/deploy) to
[**PortalJS Arc**](/docs/arc) — Datopian-managed hosting. Or self-host the static export on
any host you like.

## The AI path — `/deploy` → PortalJS Arc

```
/deploy
```

[`/deploy`](/docs/skills/deploy) builds a static export, uploads it to
[PortalJS Arc](/docs/arc), and prints a live `https://<slug>.arc.portaljs.com` URL. It
**never reports success on a failing build**, and re-running redeploys the same slug in
place.

You need a PortalJS Arc token — sign in at [arc.portaljs.com](https://arc.portaljs.com),
generate one, and set `PORTALJS_TOKEN` (or save it to `~/.portaljs/credentials`). See the
[`/deploy` skill](/docs/skills/deploy) for details.

> [!info] Static only (for now)
> Arc serves static exports. The catalog template, `/add-dataset`, `/migrate`, and
> `/connect-ckan` (SSG) all export cleanly. A portal that relies on `getServerSideProps`
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
  entry, so `/add-dataset` and `/migrate` portals export cleanly.
- **Environment variables:** for static export, inline client-side values at build time with
  `NEXT_PUBLIC_*`; for a Vercel/SSR deploy, set them in the Vercel dashboard.
- **GitHub Pages subpath:** if deploying to `https://user.github.io/repo/`, also set
  `basePath` and `assetPrefix` in `next.config.js`.

## Where to go next

- **[PortalJS Arc](/docs/arc)** — how the managed hosting works.
- **[Theming](/docs/guides/theming)** — brand the portal before you ship it.

<DocsPagination prev="/docs/guides/connect-a-ckan-backend" next="/docs/guides/theming" />
