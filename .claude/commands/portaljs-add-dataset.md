---
description: Add a dataset (CSV, TSV, JSON, or GeoJSON) to an existing PortalJS portal. Appends an entry to datasets.json so the catalog and showcase render it automatically.
allowed-tools: Read, Write, Edit, Bash, WebFetch
---

# /portaljs-add-dataset

Add a dataset to an existing PortalJS (`portaljs-catalog`) portal. Copies the data into
`/public/data/` and appends one entry to `datasets.json` — the **single source of truth**
for the catalog. No per-dataset page is created: the catalog at `/search` lists it and the
dynamic showcase route `pages/[owner]/[slug].tsx` renders it automatically at
`/@<namespace>/<slug>`.

## Required input — ask, don't error

- **Source** — a local file path (`./data/file.csv`) or a public URL (`https://example.com/data.csv`)
- **Portal directory** — path to the portal project (defaults to current directory)
- **Namespace** — the dataset's namespace value (the portal's `NAMESPACE_TYPE` group:
  a subject for `'theme'` portals, a publisher for `'owner'` portals)

Supported formats: **CSV, TSV, JSON (array), GeoJSON**

**If the source is missing, ask for it — never dead-end.** The user can say "use defaults"
to accept the defaults below.

## Steps

### 1. Gather input from `$ARGUMENTS` (interview if thin)

Extract what's present:
- `SOURCE` — file path or URL
- `PORTAL_DIR` — portal directory (default: `.`)
- `DATASET_NAME` — human-readable name (default: derived from filename)
- `DATASET_SLUG` — URL slug (default: lowercase hyphenated filename without extension)
- `DESCRIPTION` — optional one-line description
- `NAMESPACE` — namespace value (default: read the existing first entry's `namespace`
  from `datasets.json`, else `reference`)

If `SOURCE` is missing, ask (one focused prompt) and wait:
```
To add a dataset I need:
1. Source: local file path or public URL (required)
2. Portal directory (Enter for current directory)
3. Dataset name (Enter to use the filename)
4. Namespace value — the group this dataset belongs to
   (subject if the portal is "theme" mode, publisher if "owner" mode; Enter to reuse the catalog's existing namespace)
```

Check the portal's namespace mode if helpful: read `NAMESPACE_TYPE` from
`PORTAL_DIR/lib/datasets.ts` so you can phrase the namespace question correctly ("subject"
vs "publisher").

### 2. Validate the portal directory

The target must be a `portaljs-catalog` portal. Confirm `PORTAL_DIR/datasets.json`,
`PORTAL_DIR/package.json`, and `PORTAL_DIR/pages/[owner]/[slug].tsx` exist. If
`datasets.json` is missing, tell the user this portal isn't the catalog template (it may
be an older single-page template) and ask how to proceed rather than failing silently.

### 3. Detect format and fetch/copy data

**If SOURCE is a URL:**
- Fetch the URL and check the status code. If not 200, tell the user the fetch failed
  (with the HTTP status) and ask them to confirm the URL is publicly accessible / supports
  CORS, then retry.
- Detect format from the Content-Type header or URL extension.

**If SOURCE is a local file path:**
- Check the file exists. If not, tell the user the path wasn't found and ask for a correct
  path.
- Detect format from the file extension.

**Format detection rules:**
- `.csv` or `text/csv` → CSV
- `.tsv` or `text/tab-separated-values` → TSV
- `.geojson` or `application/geo+json` or (JSON-parseable and `parsed.type === "FeatureCollection"`) → GeoJSON
- `.json` or `application/json` → JSON array
- Anything else: tell the user the format isn't supported and ask them to convert to CSV,
  TSV, JSON array, or GeoJSON first.

**Copy to portal:**
```bash
mkdir -p PORTAL_DIR/public/data
cp SOURCE PORTAL_DIR/public/data/DATASET_SLUG.EXT
# or for URLs: curl -L SOURCE -o PORTAL_DIR/public/data/DATASET_SLUG.EXT
```

The `file` field in the manifest is the **bare filename** (e.g. `parks.csv`) — the
showcase serves it from `/data/<file>` and the `Table` preview fetches it client-side.

### 4. Append the entry to `datasets.json`

Open `PORTAL_DIR/datasets.json` (a JSON array) and append one entry, keeping all existing
entries. Match the `Dataset` shape from `lib/datasets.ts`:

```json
{
  "slug": "DATASET_SLUG",
  "namespace": "NAMESPACE",
  "name": "DATASET_NAME",
  "description": "DESCRIPTION",
  "file": "DATASET_SLUG.EXT",
  "format": "csv"
}
```

- `format` is one of `csv | tsv | json | geojson` (lowercase), matching the detected format.
- `namespace` is the value gathered in Step 1. `(namespace, slug)` must be **unique**
  across the manifest — if a clash exists, ask the user for a different slug or namespace.
- Drop `description` only if there genuinely is none (it's optional in the type).

That is the entire registration. `getStaticPaths` in `pages/[owner]/[slug].tsx` picks up
the new `(namespace, slug)` pair at build time, and the catalog at `/search` filters over
it. **Do not create any page file** — there is no `pages/datasets/[slug].tsx` in this
template.

### 5. Verify the build

```bash
cd PORTAL_DIR
npx next build > /tmp/portaljs-add-dataset-build.log 2>&1
BUILD_EXIT=$?
tail -20 /tmp/portaljs-add-dataset-build.log
```

If `BUILD_EXIT` is non-zero, print the log and fix the error (commonly malformed JSON in
`datasets.json`) before reporting success.

### 6. Report success

```
✓ Dataset added: DATASET_NAME
  - Data file: public/data/DATASET_SLUG.EXT
  - Manifest:  datasets.json (entry appended)
  - Showcase:  /@NAMESPACE/DATASET_SLUG  (rendered by pages/[owner]/[slug].tsx)
  - Catalog:   appears in /search automatically

Next: run `npm run dev` and visit http://localhost:3000/@NAMESPACE/DATASET_SLUG to verify,
or run /portaljs-add-chart or /portaljs-add-map to add a view to its showcase.
```

## Notes

- **No per-dataset page.** Registration is one JSON entry. The dynamic route
  `pages/[owner]/[slug].tsx` renders metadata + a `Table` data preview + a Download & API
  section + a Views placeholder for every manifest entry.
- **CSV/TSV preview** via the template's `<Table />`, which fetches `/data/<file>` in the
  browser and auto-detects the delimiter (papaparse). JSON / GeoJSON entries show a
  download link in the showcase instead of a table; use `/portaljs-add-map` for a Leaflet view of
  GeoJSON.
- **File size warning:** datasets over ~5MB load slowly in the browser; consider a backend
  (e.g. `/portaljs-connect-ckan`) or server-side pagination for production use.
- **Column names with spaces** are preserved by papaparse and wrap fine in the table — no
  fix needed.
