---
description: Add another file (resource) to an EXISTING dataset in a PortalJS portal — a data dictionary, methodology, or an additional data file. Turns a single-file dataset into a multi-resource one; the showcase renders a section per resource.
allowed-tools: Read, Write, Edit, Bash, WebFetch
---

# /portaljs-add-resource

Add a **resource** (an additional file) to a dataset that already exists in a
`portaljs-catalog` portal. Use this when a dataset is more than one file — data + a data
dictionary + a methodology doc, or quarterly/yearly files under one dataset. Where
[`/portaljs-add-dataset`](/docs/skills/portaljs-add-dataset) creates a **new** dataset (one file), this adds
a file to an **existing** one.

Mirrors the Frictionless Data Package model: a dataset holds a `resources[]` array, and the
showcase at `/@<namespace>/<slug>` renders **one section per resource** (preview, schema,
download). A single-file dataset is migrated to `resources[]` automatically the first time
you add a second file — no data is lost.

## Required input — ask, don't error

- **Target dataset** — which dataset to add to, by `slug` (or `namespace/slug`).
- **Source** — a local file path or a public URL for the new resource.
- **Portal directory** — defaults to the current directory.
- **Resource name/title** (optional) — a short id + human title for the resource.

Supported formats: **CSV, TSV, JSON (array), GeoJSON** (same as `/portaljs-add-dataset`).

**If the target dataset or source is missing, ask — never dead-end.** When the user
doesn't know the slug, read `datasets.json` and list the datasets so they can pick.

## Steps

### 1. Gather input from `$ARGUMENTS` (interview if thin)

Extract:
- `DATASET` — target dataset slug (or `namespace/slug`).
- `SOURCE` — file path or URL of the new resource.
- `PORTAL_DIR` — portal directory (default: `.`).
- `RESOURCE_NAME` — short id within the dataset (default: lowercase-hyphenated filename stem; must be unique among the dataset's resources).
- `RESOURCE_TITLE` — human title (default: derived from the filename).
- `DESCRIPTION` — optional one-line description of the resource.

If `DATASET` or `SOURCE` is missing, ask (listing existing datasets from `datasets.json`
when the slug is unknown) and wait.

### 2. Validate the portal + locate the dataset

Confirm `PORTAL_DIR/datasets.json`, `PORTAL_DIR/package.json`, and
`PORTAL_DIR/pages/[owner]/[slug].tsx` exist (the catalog template). Find the dataset entry
by `slug` (and `namespace` if given). If it doesn't exist, tell the user and offer to
create it with `/portaljs-add-dataset` instead.

### 3. Detect format and copy/fetch the file

Same as `/portaljs-add-dataset` step 3: detect format from extension/Content-Type
(`csv`/`tsv`/`json`/`geojson`), fetch a URL (check HTTP status) or check a local path
exists, then copy into the portal:

```bash
mkdir -p PORTAL_DIR/public/data
cp SOURCE PORTAL_DIR/public/data/RESOURCE_NAME.EXT
# or for URLs: curl -L SOURCE -o PORTAL_DIR/public/data/RESOURCE_NAME.EXT
```

Pick a filename that won't collide with an existing file in `/public/data`.

### 4. Add the resource to the dataset entry

Open `PORTAL_DIR/datasets.json` and update the target dataset, matching the `Dataset` /
`Resource` shape in `lib/providers/types.ts`:

- **If the dataset has no `resources` yet** (it's a single-file dataset with top-level
  `file`/`format`/`schema`), **migrate it first**: move the existing file into a
  `resources` array as the first resource, then remove the now-redundant top-level
  `file`/`format` (and top-level `schema`, which becomes that resource's schema). Preserve
  the existing data — this is a lossless transform:

  ```json
  // before
  { "slug": "orders", "name": "Orders", "file": "orders.csv", "format": "csv", "schema": { ... } }
  // after (migrated) + new resource appended
  {
    "slug": "orders", "name": "Orders",
    "resources": [
      { "name": "data", "path": "orders.csv", "format": "csv", "title": "Orders", "schema": { ... } },
      { "name": "RESOURCE_NAME", "path": "RESOURCE_NAME.EXT", "format": "<detected>", "title": "RESOURCE_TITLE", "description": "DESCRIPTION" }
    ]
  }
  ```

- **If the dataset already has `resources`**, just append the new resource object. Ensure
  `name` is unique within the array (the showcase uses it as the section key/anchor).

Keep all package-level fields (`description`, `keywords`, `licenses`, `sources`, `version`,
…) on the dataset. Drop `description` on the resource only if there genuinely is none.

That is the entire registration — `getResources()` (`lib/datasets.ts`) reads the
`resources` array and the showcase renders a section per resource automatically.

### 5. Verify the build

```bash
cd PORTAL_DIR
npx next build > /tmp/portaljs-add-resource-build.log 2>&1
BUILD_EXIT=$?
tail -20 /tmp/portaljs-add-resource-build.log
```
The common failure is malformed JSON in `datasets.json`. Fix and rebuild before reporting
success.

### 6. Report

```
✓ Resource added to DATASET: RESOURCE_TITLE (RESOURCE_NAME.EXT)
  - Data file: public/data/RESOURCE_NAME.EXT
  - Manifest:  datasets.json (dataset now has <n> resources)
  - Showcase:  /@<namespace>/<slug> renders a section per resource
```

If this was the first migration to multi-resource, note that the dataset's single `file`
was moved into `resources[]` (no data lost).

## Notes

- **One source of truth.** Resources live on the dataset's `datasets.json` entry. No page
  edits — the showcase loops `getResources(dataset)`.
- **Per-resource schema.** Describe a resource's fields with [`/portaljs-define-schema`](/docs/skills/portaljs-define-schema)
  — its Frictionless Table Schema renders under that resource's section.
- **Single-file stays simple.** Datasets with one file keep the plain `file`/`format`
  shape; migration to `resources[]` only happens when a second file is added.

## Example

```
/portaljs-add-resource orders ./data/orders-data-dictionary.csv  (title: "Data dictionary")
```
Adds a data dictionary to the existing `orders` dataset: if `orders` was a single CSV, it's
migrated to a two-resource dataset (the data + the dictionary), and its showcase now shows
a section for each. With no arguments, the skill lists your datasets and asks which one.
