---
metatitle: Deploy a PortalJS Portal – Vercel or Static Hosting
metadescription: Publish your PortalJS portal with /deploy — to Vercel for SSR/ISR, or as a fully static site for GitHub Pages, Netlify, Cloudflare, S3, or nginx. Or deploy by hand.
title: Deploy
description: Publish to Vercel or any static host — with /deploy, or by hand.
---

**Goal:** take the portal live. Two targets: **Vercel** (handles SSR/ISR natively) or
a **fully static** export you can host anywhere.

> [!info] Which target?
> Use **Vercel** for portals that may grow server-side features, or any CKAN/SSR portal
> that relies on `getServerSideProps`. Use **static** for fully client-rendered portals
> — GitHub Pages, Netlify, Cloudflare Pages, S3 + CloudFront, or plain nginx.

## The AI path — `/deploy`

```
/deploy
```

[`/deploy`](/docs/skills/deploy) auto-detects the target (a `.vercel/` link or
`output: 'export'` in `next.config.js`), builds, verifies the build passes, and either
publishes to Vercel or produces a ready-to-upload `out/` directory. It **never reports
success on a failing build**.

Force a target if you want:

```
/deploy --target static
```

## The by-hand path

**Vercel** — Vercel builds on its own infrastructure, so no local build is needed:

```bash
npx vercel        # preview
npx vercel --prod # production
```

**Static export** — set `output: 'export'` and `images: { unoptimized: true }` in
`next.config.js`, then build:

```bash
npm run build     # writes the static site to out/
npx serve out     # preview locally
```

Upload `out/` to any static host:

```bash
npx gh-pages -d out                      # GitHub Pages
netlify deploy --dir=out --prod          # Netlify
npx wrangler pages deploy out            # Cloudflare Pages
```

## Notes

- **Dynamic routes under static export** need `getStaticPaths` returning
  `{ fallback: false }`. `/add-dataset` writes one file per dataset specifically to
  avoid this; the [catalog template](/docs/templates) pre-renders every manifest entry.
- **CKAN / SSR portals can't use static** if they rely on API routes or
  `getServerSideProps` — use Vercel.
- **Environment variables** (e.g. `DMS` for CKAN portals) must be set in the Vercel
  dashboard or via `vercel env add`; for static export, inline client-side values at
  build time with `NEXT_PUBLIC_*`.
- **GitHub Pages subpath:** if deploying to `https://user.github.io/repo/`, also set
  `basePath` and `assetPrefix` in `next.config.js`.

## Where to go next

- **[Theming](/docs/guides/theming)** — brand the portal before you ship it.
- **[Templates](/docs/templates)** — the single-page vs. catalog template.

<DocsPagination prev="/docs/guides/connect-a-ckan-backend" next="/docs/guides/theming" />
