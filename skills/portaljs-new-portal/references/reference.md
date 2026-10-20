# New Portal — Reference

Detailed reference for the `portaljs-new-portal` skill. The executable workflow lives in
[`.claude/commands/portaljs-new-portal.md`](https://github.com/datopian/portaljs/blob/main/.claude/commands/portaljs-new-portal.md).

## Placeholder tokens

Every file under the copied template carries these tokens; the skill substitutes them
with `perl -pi` across `*.tsx, *.ts, *.json, *.js, *.css, *.md, .lfsconfig`:

| Token | Replaced with | Where it shows up |
| --- | --- | --- |
| `__PROJECT_NAME__` | The portal's display name | Navbar brand text, page titles, hero copy |
| `__PROJECT_SLUG__` | Lowercase, hyphenated slug of the name | Destination directory, `.lfsconfig` Git LFS endpoint URL |
| `__DESCRIPTION__` | One-line description | Hero subtitle, `<meta>` description |

Values are escaped for `/`, `\`, and `&` before substitution so URLs or ampersands in
the description don't break the `perl` replacement.

## Three surfaces (what gets scaffolded)

| Surface | Route | File | Notes |
| --- | --- | --- | --- |
| Home | `/` | `pages/index.tsx` | Hero + search box + suggested-query chips |
| Catalog | `/search` | `pages/search.tsx` | Client-side full-text filter over `datasets.json` |
| Showcase | `/@<namespace>/<slug>` | `pages/[owner]/[slug].tsx` | Metadata, `Table` preview, Download & API, Views slot |

`lib/datasets.ts` exposes `getDatasets()`, `getDataset(slug)`,
`getDatasetByNamespace(ns, slug)`, `datasetHref(d)`, and the `NAMESPACE_TYPE` constant
(`'theme'` — single publisher, grouped by subject — or `'owner'` — multiple
publishers, grouped by who published).

## UI language

Every UI string lives in `locales/en.json` and renders through `t()` (`lib/i18n.ts`).
The portal's language is `DEFAULT_LOCALE` in `next.config.js` — committed, so every build
and deploy uses it (`NEXT_PUBLIC_LOCALE` only overrides it for one build). For a
non-English portal the skill:

| Step | What |
| --- | --- |
| Translate | `locales/en.json` → `locales/<code>.json`: every key, `{placeholders}` verbatim, technical terms kept, the plural categories `Intl.PluralRules` lists for the language (Italian `one`/`many`/`other`), `_intl` set (`it-IT`) |
| Register | `import it from '../locales/it.json'` + `{ en, it }` in `LOCALES` (`lib/i18n.ts`) |
| Select | `const DEFAULT_LOCALE = 'it'` in `next.config.js` |
| Check | `npm run i18n:check` — keys, placeholders, `_intl`, registration, `DEFAULT_LOCALE` |

## Template source resolution

The skill defaults to a **remote** fetch (`npx tiged "datopian/portaljs/examples/portaljs-catalog#main"`)
so every scaffold gets the latest template. It only uses a **local** checkout when both
hold: the resolved git root has the current template (verified by the presence of
`pages/[owner]/[slug].tsx`), and the destination is outside that repo. Plain `degit` is
avoided — its silent full-clone fallback on tarball failure would drop the whole
monorepo into the target; `tiged` extracts the subdirectory correctly.

## Troubleshooting

- **Scaffolded portal has `pages/datasets/[slug].tsx` instead of `pages/[owner]/[slug].tsx`**
  — an old local template was used. Force remote mode by scaffolding from outside any
  portaljs clone, or set `PORTALJS_TEMPLATE_REF` explicitly.
- **`npm install` hangs or fails** — check Node.js is >=22; the template's dependencies
  target the current Next.js 14 / React 18 baseline.
- **`.next/` corruption / 404s after scaffolding** — never run `next build` right after
  scaffolding while `npm run dev` is active; verify with `npx tsc --noEmit` instead.
- **Portal builds in English although it was translated** — `DEFAULT_LOCALE` in
  `next.config.js` is still `'en'`, or the locale isn't registered in `lib/i18n.ts`;
  `npm run i18n:check` reports both.
- **Portal still shows the PortalJS logo in production** — branding is a placeholder;
  swap `public/icon.svg`, `public/favicon.ico`, `public/apple-touch-icon.png`, and
  `public/icon-512.png` for the client's own marks.
