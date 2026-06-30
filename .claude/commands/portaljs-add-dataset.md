---
description: Add a dataset (CSV, TSV, JSON, or GeoJSON) to an existing PortalJS portal. Appends an entry to datasets.json so the catalog and showcase render it automatically; routes the data by source (local file vs remote URL) — R2 via Git LFS by default, remote URLs by passthrough.
allowed-tools: Read, Write, Edit, Bash, WebFetch
---

# /portaljs-add-dataset

Add a dataset to an existing PortalJS (`portaljs-catalog`) portal. Appends one entry to
`datasets.json` — the **single source of truth** for the catalog — and routes the data to
the right place by **source first, then size**. No per-dataset page is created: the catalog
at `/search` lists it and the dynamic showcase route `pages/[owner]/[slug].tsx` renders it
automatically at `/@<namespace>/<slug>`.

## The routing matrix — branch on SOURCE, then size

Where the bytes end up depends first on **where they come from**, then on size/intent. The
manifest's `resource.path` (or single-file `file`) is the unifying abstraction:
`resourceUrl()` in `lib/datasets.ts` serves a **repo-relative** path from `/public/data` and
passes an **absolute URL** straight through. So every route below just decides what string
to write into `path`.

| Source | Default | What happens | Manifest `path` |
|--------|---------|--------------|-----------------|
| **Local file** | **R2 via Git LFS** | `mv` into the repo, `git lfs track <path>`, commit a ~134 B pointer, push → Giftless → R2 | **absolute R2 URL** (browser fetches R2 directly) |
| **Local file** (fenced) | inline | *Only* bundled SAMPLE data or an OSS self-host with no R2: `cp` into `public/data/` (stays inline per `.gitattributes` fence) | bare filename → `/data/<file>` |
| **Remote URL** | **passthrough** | record the URL as-is — **no download, no upload, zero duplication** | the **absolute URL**, unchanged |
| **Remote URL** | adopt (opt-in) | user wants it hosted/versioned under the portal: fetch → route as a local file (R2/LFS) | **absolute R2 URL** |

**Storage decision (epic po-g9y):** the default for added data is **R2**, regardless of
size or format. Inline is *not* a size threshold — it is a fenced exception for bundled
sample data and the OSS-no-R2 fallback. Remote URLs default to **passthrough** (copy
nothing); adopting one into R2 is an explicit opt-in.

> **Remote-URL passthrough caveat:** serving and linking always work. But **in-browser
> range / DuckDB queries** against a 3rd-party URL need CORS + range support on *that* host,
> which we don't control. If the user needs querying (not just preview/download) and the
> remote lacks CORS/range, recommend the **adopt-into-R2** option.

Supported formats for the **showcase preview/registration**: **CSV, TSV, JSON (array),
GeoJSON**. (LFS itself is format-agnostic — any binary can be tracked — but the showcase
`Table`/map only previews these.)

## Required input — ask, don't error

- **Source** — a local file path (`./data/file.csv`) or a public URL (`https://…/data.csv`)
- **Portal directory** — path to the portal project (defaults to current directory)
- **Namespace** — the dataset's namespace value (the portal's `NAMESPACE_TYPE` group:
  a subject for `'theme'` portals, a publisher for `'owner'` portals)

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
- `ADOPT` — for a remote URL only: whether to adopt the file into R2 (default: **no** —
  passthrough). Only ask if the URL route is taken and querying is plausibly needed.

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

### 3. Detect the format

**If SOURCE is a URL:** fetch headers (or a `HEAD`) and check the status. If not 200, tell
the user the fetch failed (with the HTTP status) and ask them to confirm the URL is publicly
accessible, then retry. Detect format from `Content-Type` or the URL extension. *(For the
default passthrough route you do not download the body — only enough to detect format.)*

**If SOURCE is a local file path:** check the file exists. If not, tell the user the path
wasn't found and ask for a correct path. Detect format from the file extension.

**Format detection rules:**
- `.csv` or `text/csv` → CSV
- `.tsv` or `text/tab-separated-values` → TSV
- `.geojson` or `application/geo+json` or (JSON-parseable and `parsed.type === "FeatureCollection"`) → GeoJSON
- `.json` or `application/json` → JSON array
- Anything else: tell the user the showcase can't preview this format and ask them to
  convert to CSV, TSV, JSON array, or GeoJSON first.

### 4. Route the data (the core of this skill)

Pick the branch from the matrix above. **Decide on SOURCE first.**

#### 4a. Remote URL — passthrough (DEFAULT for URLs)

Do **nothing** to the bytes. The manifest `path` is the absolute URL itself; `resourceUrl()`
passes it through and the browser fetches it directly. Skip to Step 5 with
`MANIFEST_PATH=<the URL>`.

Mention the CORS/range caveat if the user may need querying, and offer the adopt route.

#### 4b. Remote URL — adopt into R2 (OPT-IN only)

Only when the user explicitly wants the file hosted/versioned under the portal. Download it
to a temp path, then fall through to **4c** treating that temp file as the local source:
```bash
curl -fL "$SOURCE" -o "/tmp/$DATASET_SLUG.$EXT"
```

#### 4c. Local file — R2 via Git LFS (DEFAULT)

This versions a tiny pointer in git and streams the bytes to Cloudflare R2 through Giftless.
The browser then fetches the bytes straight from R2 (manifest `path` = absolute R2 URL).

```bash
cd PORTAL_DIR
mkdir -p data
# mv (NOT cp) so an external local file isn't tripled on disk:
mv "$SOURCE" "data/$DATASET_SLUG.$EXT"     # for 4b, $SOURCE is the temp download

# Per-file, format-agnostic LFS tracking (appends a path entry to .gitattributes,
# NOT an extension glob):
git lfs track "data/$DATASET_SLUG.$EXT"
git add .gitattributes "data/$DATASET_SLUG.$EXT"
git commit -m "data: add $DATASET_SLUG via LFS"
```

> **mv, not cp.** When bringing an external local file into the repo, move it in place — a
> `cp` leaves a 3rd on-disk copy (original + working tree + `.git/lfs` cache).

**Authenticate git-lfs (phase-2 gotcha, po-g9y.1).** The committed `.lfsconfig` carries the
Giftless URL but **no credentials**. Mint a repo-scoped JWT and set the credentialed URL in
**local** git config only (never commit it). Use the `_jwt` HTTP Basic piggyback — do *not*
set a broad `http.extraHeader`, which git-lfs would replay onto the presigned R2 PUT (R2 →
`400`) and the verify callback.

**Mint the token from the Arc API (default — no private key on your machine).** The Arc API
is the token issuer (po-g9y.13): it holds the RS256 signer as a Worker secret and mints a
scoped, short-TTL LFS token for any authenticated Arc user. Reuse the same Arc token
`/portaljs-deploy` resolves (`PORTALJS_TOKEN`, else `~/.portaljs/credentials`); if you have
neither, run `/portaljs-deploy`'s sign-in step once. The endpoint returns a ready-to-use
credentialed `lfs_url`:
```bash
API="${PORTALJS_ARC_API:-https://api.arc.portaljs.com}"
ARC_TOKEN="${PORTALJS_TOKEN:-$(node -e "try{process.stdout.write(JSON.parse(require('fs').readFileSync(process.env.HOME+'/.portaljs/credentials','utf8')).token||'')}catch{}")}"
# Pushing data needs write: request ?actions=read,write,verify (default is read-only,
# pull). ?ttl=<secs> to tune. The slug must already exist (deploy it first); the
# endpoint will NOT create it. 404 = deploy first; 403 = owned by another account.
LFS_URL=$(curl -fsS -X POST "$API/v1/repos/<project-slug>/lfs-token?actions=read,write,verify" \
  -H "Authorization: Bearer $ARC_TOKEN" \
  | node -e "process.stdin.on('data',d=>process.stdout.write(JSON.parse(d).lfs_url))")
git config lfs.url "$LFS_URL"     # local only — carries the token, never committed
```

> **OSS self-host fallback.** Running your own Giftless without an Arc account? Sign the token
> locally with the issuer's private key instead:
> ```bash
> TOKEN=$(python3 ../../giftless/mint-token.py --org datopian --repo <project-slug> \
>   --ttl 3600 --algorithm RS256 --key-file ../../giftless/jwt_private_key)
> git config lfs.url "https://_jwt:$TOKEN@lfs.portaljs.com/datopian/<project-slug>"
> ```

(See `giftless/README.md` → "Authenticating a Git LFS client".)

**Push the bytes to R2, then reclaim local disk:**
```bash
git push
git lfs prune    # working tree + .git/lfs cache ≈ 2× locally until pruned
```

**Build the absolute R2 URL for the manifest.** The browser fetches R2 directly, so
`path` must be the public R2 URL — `resourceUrl()` passes absolute URLs through unchanged.
The Giftless object key is `lfs/datopian/<project-slug>/<oid>`, where `<oid>` is the SHA-256
in the committed LFS pointer:
```bash
OID=$(git cat-file -p :data/$DATASET_SLUG.$EXT | sed -n 's/^oid sha256://p')
# MANIFEST_PATH = <R2_PUBLIC_BASE>/lfs/datopian/<project-slug>/$OID
```
`R2_PUBLIC_BASE` is the bucket's public base URL (custom domain or `r2.dev`). **If you don't
know it, ask the user** — don't guess. (The staging public base is provisioned per
deployment; see `giftless/README.md`.)

#### 4d. Local file — inline (FENCED exception only)

*Only* for bundled SAMPLE data shipped with a template, or an OSS self-host running without
R2 credentials. Copy into `public/data/`, which the `.gitattributes` fence keeps inline:
```bash
mkdir -p PORTAL_DIR/public/data
cp "$SOURCE" "PORTAL_DIR/public/data/$DATASET_SLUG.$EXT"
```
`MANIFEST_PATH` is the **bare filename** (`$DATASET_SLUG.$EXT`) → served from `/data/<file>`.

### 5. Append the entry to `datasets.json`

Open `PORTAL_DIR/datasets.json` (a JSON array) and append one entry, keeping all existing
entries. Match the `Dataset` shape from `lib/providers/types.ts`:

```json
{
  "slug": "DATASET_SLUG",
  "namespace": "NAMESPACE",
  "name": "DATASET_NAME",
  "description": "DESCRIPTION",
  "file": "MANIFEST_PATH",
  "format": "csv"
}
```

- `file` is `MANIFEST_PATH` from Step 4: a bare filename (inline), or an absolute URL
  (passthrough or R2). `resourceUrl()` resolves both.
- `format` is one of `csv | tsv | json | geojson` (lowercase), matching the detected format.
- `namespace` is the value gathered in Step 1. `(namespace, slug)` must be **unique** across
  the manifest — if a clash exists, ask the user for a different slug or namespace.
- Drop `description` only if there genuinely is none (it's optional in the type).

That is the entire registration. `getStaticPaths` in `pages/[owner]/[slug].tsx` picks up the
new `(namespace, slug)` pair at build time, and the catalog at `/search` filters over it.
**Do not create any page file** — there is no `pages/datasets/[slug].tsx` in this template.

### 6. Verify the build

```bash
cd PORTAL_DIR
npx next build > /tmp/portaljs-add-dataset-build.log 2>&1
BUILD_EXIT=$?
tail -20 /tmp/portaljs-add-dataset-build.log
```

If `BUILD_EXIT` is non-zero, print the log and fix the error (commonly malformed JSON in
`datasets.json`) before reporting success.

### 7. Report success

```
✓ Dataset added: DATASET_NAME
  - Route:     <local→R2 LFS | remote URL passthrough | adopted→R2 | inline sample>
  - Data:      <data/DATASET_SLUG.EXT (LFS → R2) | the source URL | public/data/DATASET_SLUG.EXT>
  - Manifest:  datasets.json (entry appended; path = MANIFEST_PATH)
  - Showcase:  /@NAMESPACE/DATASET_SLUG  (rendered by pages/[owner]/[slug].tsx)
  - Catalog:   appears in /search automatically
```
For an LFS route, remind the user the bytes are in R2 and `git lfs prune` has reclaimed local
disk. Then:
```
Next: run `npm run dev` and visit http://localhost:3000/@NAMESPACE/DATASET_SLUG to verify,
or run /portaljs-add-chart or /portaljs-add-map to add a view to its showcase.
```

## Notes

- **No per-dataset page.** Registration is one JSON entry. The dynamic route
  `pages/[owner]/[slug].tsx` renders metadata + a `Table` data preview + a Download & API
  section + a Views placeholder for every manifest entry.
- **`path` is the seam.** Repo-relative → `/data/<file>` (inline); absolute URL → passed
  through (remote passthrough or R2). One abstraction (`resourceUrl()`) serves all routes —
  never branch on the source at the call site.
- **CSV/TSV preview** via the template's `<Table />`, which fetches the resolved URL in the
  browser and auto-detects the delimiter (papaparse). JSON / GeoJSON entries show a download
  link in the showcase; use `/portaljs-add-map` for a Leaflet view of GeoJSON.
- **LFS is format-agnostic.** `.gitattributes` ships minimal (only the inline fence); this
  skill appends a per-file tracking entry for whatever it routes to R2 — including images and
  arbitrary binaries — never an extension glob.
- **Column names with spaces** are preserved by papaparse and wrap fine in the table.
