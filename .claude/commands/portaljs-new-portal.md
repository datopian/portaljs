---
description: Scaffold a new PortalJS data portal from a brief. Copies the canonical template from examples/portaljs-catalog and substitutes project tokens.
allowed-tools: Read, Write, Edit, Bash
---

# /portaljs-new-portal

Scaffold a production-ready PortalJS data portal. The skill is **interactive**: if the
brief is thin, it interviews the user in three short rounds (mapped to the template's
three surfaces — Home, Catalog, Showcase), echoes a brief back for confirmation, then
copies `examples/portaljs-catalog`, substitutes placeholder tokens, sets the namespace
mode, seeds any datasets, installs dependencies, and verifies the build.

## The template you are scaffolding

`examples/portaljs-catalog` is the canonical template. It has **three surfaces**:

| Surface | Route | File | What it is |
|---|---|---|---|
| Home | `/` | `pages/index.tsx` | Search-first landing: hero + search box + suggested-query chips (`__PROJECT_NAME__` / `__DESCRIPTION__` tokens) |
| Catalog / search | `/search` | `pages/search.tsx` | Client-side full-text list over `datasets.json` |
| Dataset showcase | `/@<namespace>/<slug>` | `pages/[owner]/[slug].tsx` | One dataset: metadata, `Table` data preview, Download & API, and a Views placeholder for charts/maps |

The catalog is driven by `datasets.json` (the single source of truth) — each entry is
`{ slug, name, description, file, format, namespace }`. `lib/datasets.ts` exposes
`getDatasets()`, `getDataset(slug)`, `getDatasetByNamespace(ns, slug)`, `datasetHref(d)`
→ `/@${namespace}/${slug}`, and a `NAMESPACE_TYPE: 'theme' | 'owner'` constant.

A portal uses **exactly one** namespace mode:
- **`'theme'`** — a single-publisher portal whose datasets are grouped by subject
  (e.g. `@reference/country-codes`). The showcase labels the namespace "Theme".
- **`'owner'`** — a multi-publisher portal whose datasets are grouped by who published
  them (e.g. `@worldbank/country-codes`). The showcase labels the namespace "Owner".

Search is a **static client-side list** for now. A live backend (e.g. CKAN, via
`/portaljs-connect-ckan`) can replace `datasets.json` later without changing the URL structure.

## Required input — interview, don't error

You need a **project name** and **one-line description**. Datasets are optional at
scaffold time. **Never dead-end with a missing-input error.** If `$ARGUMENTS` is empty or
thin, run the structured interview in Step 1 to gather what's missing. The user can say
**"use defaults"** at any point to skip a round and accept the defaults below.

## Steps

### 1. Interview the user (skip rounds already answered by `$ARGUMENTS`)

Parse `$ARGUMENTS` first and pre-fill anything it already specifies. Then ask only for
what's still missing, **one focused round at a time** (wait for the answer before the next
round). Each round maps to a template surface. Tell the user they can reply "use defaults"
to take the defaults.

**Round 1 — Home / basics:**
```
Round 1 of 3 — the home page.
1. What's the portal called? (e.g. "Auckland Open Data Portal")
2. One-line description for the hero? (default: "An open data portal.")
3. Who is it for / what's it about? (helps pick suggested-search chips)
```

**Round 2 — Catalog & discovery:**
```
Round 2 of 3 — the catalog (the /search list).
1. Which datasets should it start with? Give file paths or URLs, or "none yet".
2. Roughly how many datasets total — a handful, dozens, hundreds?
3. Single publisher or multiple?
   - single  → datasets grouped by SUBJECT (namespace mode "theme")
   - multiple → datasets grouped by PUBLISHER (namespace mode "owner")
   Then: what namespace value(s)? (e.g. "reference", or "worldbank, eurostat")
```
Note for the user when relevant: search is a static client-side list over
`datasets.json` for now; a live backend (CKAN) can be wired in later with
`/portaljs-connect-ckan` without changing URLs.

**Round 3 — Showcase / views:**
```
Round 3 of 3 — each dataset's showcase page (/@<namespace>/<slug>).
Every showcase already shows metadata + a data preview + a Download & API section.
For the dataset(s) above, do any need an extra view?
  - a chart (line/bar/area/pie/scatter) → added later with /portaljs-add-chart
  - a map (GeoJSON on Leaflet)          → added later with /portaljs-add-map
(Press Enter / "use defaults" for metadata + preview + download only.)
```

**Defaults if a round is skipped:** description `"An open data portal."`; no datasets;
`NAMESPACE_TYPE = 'theme'` with namespace value `reference`; no extra views.

### 2. Confirm the brief before building

Echo a short brief back and wait for a yes:
```
Here's the plan — say "go" to build, or correct anything:
  • Name:        PROJECT_NAME  (slug: PROJECT_SLUG)
  • Description: DESCRIPTION
  • Namespace:   NAMESPACE_TYPE — value(s): NS_VALUES
  • Datasets:    <list, or "none — add later with /portaljs-add-dataset">
  • Views to add after scaffold: <charts/maps per dataset, or "none">
```

Derive `PROJECT_SLUG` from `PROJECT_NAME` (lowercase, hyphenated, no special chars, e.g.
`auckland-open-data`).

### 3. Resolve the template source

This skill works **both inside a clone of the portaljs repo and from any other project**.
**Default to fetching the template remotely (always the latest).** Use a local checkout
only when you are genuinely inside an up-to-date portaljs repo AND not scaffolding into it.
The default — and currently only — variant is `examples/portaljs-catalog`.

```bash
TEMPLATE_VARIANT="examples/portaljs-catalog"

# Default: fetch the latest template from GitHub. Override the ref with
# PORTALJS_TEMPLATE_REF (branch, tag, or commit); defaults to main.
TEMPLATE_MODE="remote"
PORTALJS_TEMPLATE_REF="${PORTALJS_TEMPLATE_REF:-main}"

# Use a LOCAL checkout only when BOTH hold (otherwise stay remote):
#  1. the resolved repo has the CURRENT template — verified by the @-namespaced
#     route file pages/[owner]/[slug].tsx. An old clone without it would scaffold a
#     stale, non-namespaced portal (pages/datasets/[slug].tsx) — issue #1556.
#  2. we are NOT scaffolding inside that repo (never create a portal inside the
#     framework repo itself).
if GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) \
   && [ -f "$GIT_ROOT/$TEMPLATE_VARIANT/pages/[owner]/[slug].tsx" ]; then
  case "$(pwd)/" in
    "$GIT_ROOT/"*)
      echo "Inside the portaljs repo — fetching the template remotely instead of copying in place." ;;
    *)
      TEMPLATE_MODE="local"
      TEMPLATE_DIR="$GIT_ROOT/$TEMPLATE_VARIANT" ;;
  esac
fi
```

### 4. Materialize the template

First, check the destination does not already exist. If `./$PROJECT_SLUG` is non-empty,
**don't error out blindly — ask** the user for a different name or whether to remove the
existing directory, then proceed with their answer:

```bash
if [ -d "./$PROJECT_SLUG" ] && [ "$(ls -A "./$PROJECT_SLUG" 2>/dev/null)" ]; then
  echo "DIR_EXISTS: ./$PROJECT_SLUG already exists and is non-empty."
fi
```

If it exists, ask: *"./PROJECT_SLUG already exists. Use a different name, or remove it and
continue?"* and act on the reply.

Then materialize, depending on the resolved mode:

```bash
if [ "$TEMPLATE_MODE" = "local" ]; then
  cp -rP "$TEMPLATE_DIR" "./$PROJECT_SLUG"
  # Remove build artifacts that must not be copied
  rm -rf "./$PROJECT_SLUG/node_modules" "./$PROJECT_SLUG/.next"
else
  # tiged (maintained degit fork) fetches a subdirectory of a repo with no git
  # history or node_modules. NOTE: plain `degit` is NOT reliable here — when its
  # tarball fetch fails it silently falls back to a full `git clone` that ignores
  # the subdirectory, dropping the WHOLE monorepo into the target (exit 0). tiged
  # extracts the subdirectory correctly.
  npx --yes tiged "datopian/portaljs/$TEMPLATE_VARIANT#$PORTALJS_TEMPLATE_REF" "./$PROJECT_SLUG"
fi
```

If the remote fetch fails (bad ref, network, or tiged unavailable), tell the user plainly
and ask how to proceed (retry / different ref / check network). The scaffolded portal
(Next.js) requires **Node.js >=18**; `npx tiged` itself runs on older Node, but use >=18
to match the template. (The resolver already defaults to remote when no current local
template is found, so a missing or stale local checkout falls through to the latest
template automatically.)

### 5. Substitute placeholder tokens

Replace all occurrences of the placeholder tokens in every file under `./$PROJECT_SLUG/`:

| Token | Replace with |
|-------|-------------|
| `__PROJECT_NAME__` | `PROJECT_NAME` |
| `__PROJECT_SLUG__` | `PROJECT_SLUG` |
| `__DESCRIPTION__` | `DESCRIPTION` |

Use `perl -pi` (portable across macOS and Linux). Escape values first so that `/`, `\`, and `&` in the inputs don't break substitution:

```bash
# Escape any / or \ in values for use as perl replacement strings
esc() { printf '%s' "$1" | perl -pe 's{([/\\])}{\\$1}g'; }
NAME_ESC=$(esc "$PROJECT_NAME")
SLUG_ESC=$(esc "$PROJECT_SLUG")
DESC_ESC=$(esc "$DESCRIPTION")

find "./$PROJECT_SLUG" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.json" -o -name "*.js" -o -name "*.css" -o -name "*.md" -o -name ".lfsconfig" \) \
  | xargs perl -pi -e "
      s/__PROJECT_NAME__/$NAME_ESC/g;
      s/__PROJECT_SLUG__/$SLUG_ESC/g;
      s/__DESCRIPTION__/$DESC_ESC/g"
```

`.lfsconfig` carries the `__PROJECT_SLUG__` token in its Git LFS endpoint URL (large data
is served via Giftless → R2 — see the template README's "Large data" section), so it is
included in the substitution above.

Optionally tailor the `SUGGESTED_QUERIES` array near the top of `pages/index.tsx` to the
portal's topics (from Round 1) — these are the suggested-search chips under the hero.

**Branding is a placeholder.** The template ships with the PortalJS mark as default branding
(favicon, navbar logo with a hover-spin, and PWA/social icons) so a fresh portal looks
intentional out of the box. `__PROJECT_NAME__` substitution already sets the navbar's brand
text. The icon files are deliberately swappable — tell the user they can replace
`public/icon.svg`, `public/favicon.ico`, `public/apple-touch-icon.png`, and
`public/icon-512.png` with their own marks (no code change needed; the links live in
`pages/_document.tsx` and `components/Navbar.tsx`). Do **not** leave a client portal
permanently wearing the PortalJS logo.

### 6. Set the namespace mode

Edit `./$PROJECT_SLUG/lib/datasets.ts` and set `NAMESPACE_TYPE` from the interview:
`'theme'` for a single publisher (datasets grouped by subject) or `'owner'` for multiple
publishers (datasets grouped by who published them). The default in the template is
`'theme'`.

```bash
# Set to 'owner' only if the interview chose a multi-publisher portal.
perl -pi -e "s/export const NAMESPACE_TYPE: 'theme' \\| 'owner' = '[a-z]+'/export const NAMESPACE_TYPE: 'theme' | 'owner' = 'owner'/" "./$PROJECT_SLUG/lib/datasets.ts"
```

### 7. Seed datasets captured in the interview

The template ships with three sample entries in `datasets.json` (under namespace
`reference`). If the user named real datasets in Round 2, **replace the samples** with
their data; if they said "none yet", **clear** the manifest to `[]` so the `/search` page
shows its empty state.

For each captured dataset, run the `/portaljs-add-dataset` flow (preferred — it handles
fetch/copy, format detection, and manifest append), or append directly: drop the file in
`./$PROJECT_SLUG/public/data/` and add an entry to `datasets.json` shaped like:

```json
{
  "slug": "<url-safe-slug>",
  "namespace": "<the NS value from Round 2>",
  "name": "<Human Name>",
  "description": "<one line>",
  "file": "<file-in-public-data>",
  "format": "csv"
}
```

Use the namespace value(s) from Round 2 (the portal's `NAMESPACE_TYPE` mode). No
per-dataset page is needed — `pages/[owner]/[slug].tsx` renders every entry at
`/@<namespace>/<slug>` automatically.

### 8. Install dependencies

```bash
cd "./$PROJECT_SLUG" && npm install
```

Tell the user first: `Installing dependencies (2–5 min on cold cache)...`

If `npm install` fails, report the error plainly and ask the user to check Node.js >=18
and network access before retrying.

### 9. Verify scaffold-ready

Type-check (do NOT run `next build` here). `next build` writes to `.next/`, the same
directory a running `npm run dev` uses — building over a live dev server corrupts it
(the portal then 404s its own chunks). The normal flow is "scaffold → `npm run dev` to
watch it → keep adding datasets," so verify with `tsc`, which writes nothing to `.next/`:

```bash
cd "./$PROJECT_SLUG"
npx tsc --noEmit > /tmp/portaljs-new-portal-verify.log 2>&1
VERIFY_EXIT=$?
tail -20 /tmp/portaljs-new-portal-verify.log
```

If `VERIFY_EXIT` is non-zero, print the log and fix the error before reporting success.
Do not report success while type-checking still fails. (A full `next build` happens in
`/portaljs-deploy`, which guards against a running dev server.)

### 10. Report success

```
✓ Portal scaffolded at ./PROJECT_SLUG
  - Home:     /                       (pages/index.tsx — search + chips)
  - Catalog:  /search                 (pages/search.tsx — filters datasets.json)
  - Showcase: /@<namespace>/<slug>    (pages/[owner]/[slug].tsx)
  - Namespace mode: NAMESPACE_TYPE
✓ Branding: PortalJS placeholder mark (favicon + navbar logo) — swap the files in
  public/ (icon.svg, favicon.ico, apple-touch-icon.png, icon-512.png) for your own.
✓ Run: cd PROJECT_SLUG && npm run dev  →  http://localhost:3000
```

If datasets still need adding (named in the interview but not yet seeded, or "none yet"):
```
Next steps:
  - /portaljs-add-dataset       load a dataset (appends to datasets.json, renders at /@<ns>/<slug>)
  - /portaljs-add-chart         add a chart to a dataset's showcase Views section
  - /portaljs-add-map           add a Leaflet map to a dataset's showcase Views section
  - /portaljs-connect-ckan      swap the static catalog for a live CKAN backend
```

## Example

```
/portaljs-new-portal Auckland Open Data Portal — datasets published by several council
departments (multiple publishers). Start with ./data/parks.csv and ./data/budget.csv.
```
From this the skill infers name + description, picks `NAMESPACE_TYPE = 'owner'` (multiple
publishers), asks for the namespace values (e.g. `parks-dept`, `finance`), confirms the
brief, scaffolds `examples/portaljs-catalog`, and seeds the two datasets so they render at
`/@parks-dept/parks` and `/@finance/budget`. With no arguments at all, the skill simply
runs the three-round interview first.
