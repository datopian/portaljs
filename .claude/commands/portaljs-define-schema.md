---
description: Define a dataset's metadata profile — infer a Frictionless Table Schema from its data, add Data Package metadata (license, sources, keywords), and write it into datasets.json so the showcase renders a typed field table. Extend or customize via the L0→L3 profile ladder.
allowed-tools: Read, Write, Edit, Bash
---

# /portaljs-define-schema

The **authoring** skill for the metadata-profile contract (`lib/metadata`). Where
[`/portaljs-add-dataset`](/docs/skills/portaljs-add-dataset) registers *that a dataset exists*, this skill
describes *what its data means*: it infers a Frictionless **Table Schema** (fields, types,
constraints) from the data, adds the **Data Package** descriptor fields a catalog surfaces
(title, licenses, sources, keywords), and writes them onto the dataset's entry in
`datasets.json`. The showcase at `/@<namespace>/<slug>` then renders a typed
column/description table instead of a bare preview.

The model is **Frictionless-native**. DCAT / DCAT-AP is a serialization layer on top
(designed-in at `lib/metadata/dcat.ts`, built in the later DCAT-interop phase) — this
skill authors the native model, not the export.

The skill is **interactive** and **never dead-ends**: if the brief is thin it interviews
in short rounds, infers sensible defaults from the data, echoes the schema for
confirmation, and lets you reply **"use defaults"** to accept the inferred schema as-is.

See [`lib/metadata/README.md`](https://github.com/datopian/portaljs/blob/main/examples/portaljs-catalog/lib/metadata/README.md)
for the contract and the L0→L3 ladder.

## The profile ladder — pick a level

Most datasets want **L0**. Reach for higher levels only when you actually need them.

| Level | What it is | When |
|-------|-----------|------|
| **L0** | Use the default `frictionless-tabular` profile as-is; just declare the dataset's schema + metadata. | Default. Tabular CSV/TSV with the standard Frictionless types. |
| **L1** | Extend L0 — same default profile, plus a few extra package fields you care about. | You need extra descriptive metadata but standard validation is fine. |
| **L2** | A fully custom profile (your own `schema` template + `validate()`), registered in `lib/metadata`. | A dataset type with validation rules L0 doesn't express. |
| **L3** | Multiple profiles in the registry, resolved per dataset by its `profile` field. | A portal mixing dataset types, each with its own profile. |

## Steps

### 1. Gather input from `$ARGUMENTS` (interview if thin)

Extract what's present:
- `PORTAL_DIR` — portal directory (default: `.`)
- `DATASET` — which dataset to describe, by `slug` or `namespace/slug`
- `LEVEL` — `L0` (default) · `L1` · `L2` · `L3`

If `DATASET` is missing, read `PORTAL_DIR/datasets.json` and ask which one (list the
slugs), then wait:
```
Which dataset should I define a schema for? (reply with a slug, or "all" to do each in turn)
  - country-codes        (reference)  — already has a schema
  - population-2022       (reference)  — no schema yet
  - co2-emissions         (reference)  — no schema yet
You can also say "use defaults" and I'll infer the schema from the data and confirm it.
```

Don't ask about the level up front — default to **L0** and only offer to go higher in
step 4 if the data or the user's answers call for it.

### 2. Validate the portal directory

The target must be a `portaljs-catalog` portal with the metadata contract. Confirm
`PORTAL_DIR/datasets.json`, `PORTAL_DIR/lib/metadata/types.ts`, and
`PORTAL_DIR/pages/[owner]/[slug].tsx` exist. If `lib/metadata/` is missing, the portal
predates the metadata-profile contract — tell the user and offer to proceed by writing the
schema onto `datasets.json` anyway (the fields are optional and ignored by older
showcases) rather than failing.

### 3. Infer the Table Schema from the data

Locate the dataset entry in `datasets.json`, then read its file from
`PORTAL_DIR/public/data/<file>`. For CSV/TSV, sample the header + first ~50 data rows:

```bash
# Replace FILE with PORTAL_DIR/public/data/<file>.
head -1 FILE        # header → field names
sed -n '2,51p' FILE # sample rows → infer types
```

Infer each field's `type` from the sampled values, using the contract's vocabulary
(`lib/metadata/types.ts` → `FieldType`): `integer` if every value matches `^[+-]?\d+$`;
`number` if numeric but not all integers; `year` if all 4-digit; `boolean` for
true/false/yes/no/0/1; `date`/`datetime` if `Date.parse`-able; `geopoint` for `"lon, lat"`;
otherwise `string`. When a column is empty or ambiguous, default to `string` — never guess
wildly. (This mirrors `coercesTo()` in `frictionless-tabular.ts`, so an inferred schema
validates clean against its own data.)

Build a `TableSchema`:
- One `Field` per column: `name` (exact header, spaces preserved), inferred `type`, and a
  short `title` + `description` you draft from the column name and the dataset's purpose.
- `constraints`: mark `required: true` for columns with no missing values in the sample;
  `unique: true` for columns whose sampled values are all distinct; add a `pattern` only
  when the values clearly fit one (e.g. uppercase codes `^[A-Z]{2}$`).
- `primaryKey`: the column (or composite) that uniquely identifies a row, if obvious.

For **JSON / GeoJSON** datasets, the L0 tabular profile doesn't apply — explain that
schema authoring here covers tabular data, offer to capture package metadata only (step 5),
and stop short of a `fields` schema.

### 4. Confirm the schema (and offer to go beyond L0)

Echo the inferred schema as a compact table for confirmation:
```
Inferred schema for <dataset> — say "go" to write it, or correct any field:

  field        type      required  unique  notes
  -----------  --------  --------  ------  -----------------------------
  <name>       <type>    <y/n>     <y/n>   <title / pattern>
  ...
  primaryKey: <col(s) or none>

This uses the default L0 'frictionless-tabular' profile.
```
Then, only if warranted, offer to go higher: "Want extra metadata fields (L1), or a custom
profile with its own validation rules (L2/L3)?" Default stays **L0** if they say "go".

### 5. Capture Data Package metadata

Ask for the descriptor fields the showcase surfaces (all optional — Enter/"skip" to omit):
```
Optional dataset metadata (Enter to skip any):
  - license      (e.g. ODbL-1.0, CC-BY-4.0)
  - source(s)    (title + URL of where the data came from)
  - keywords     (comma-separated)
  - version      (e.g. 1.0.0)
```
Map answers to the `Dataset` fields `licenses[]` ({name,title,path}), `sources[]`
({title,path}), `keywords[]`, `version` (and `modified` with today's date if the data was
just updated).

### 6. Write it into `datasets.json`

Open `PORTAL_DIR/datasets.json` and update the target dataset's entry **in place**,
preserving all other entries and the existing `slug`/`namespace`/`name`/`file`/`format`
fields. Add:

```json
{
  "...": "existing fields unchanged",
  "profile": "frictionless-tabular",
  "schema": {
    "primaryKey": "<col or [cols]>",
    "fields": [
      { "name": "<col>", "type": "<type>", "title": "<title>", "description": "<desc>",
        "constraints": { "required": true } }
    ]
  },
  "licenses": [ { "name": "<id>", "title": "<title>", "path": "<url>" } ],
  "sources":  [ { "title": "<title>", "path": "<url>" } ],
  "keywords": ["..."],
  "version": "<x.y.z>"
}
```

This matches the extended `Dataset` shape in `lib/providers/types.ts`. Drop any field with
no value (all are optional). Omit `profile` to let it default to `frictionless-tabular`, or
set it explicitly for clarity. For an L2/L3 custom profile, set `profile` to that profile's
id.

**For L2 / L3 (custom profile):** scaffold a profile module and register it so the
dataset's `profile` id resolves:
- Write `PORTAL_DIR/lib/metadata/<profile-id>.ts` exporting a `MetadataProfile`
  (`id`, `name`, `version`, optional pinned `schema`, and a `validate(input)` — start from
  `frictionlessTabularProfile`'s shape and add the extra rules).
- Register it once at load: in `PORTAL_DIR/lib/metadata/registry.ts` import the profile and
  add `registerProfile(<profile>)`, or call `registerProfile` from app bootstrap.
- Keep L0 as the fallback — `getProfile(id)` already returns the default for unknown ids.

### 7. Validate the schema against the data (optional but recommended)

The L0 profile can check the schema against the dataset's rows (type-coercion + the
constraint subset). Offer a quick check using the contract:

```bash
cd PORTAL_DIR
npx tsx -e '
  import { getProfile } from "./lib/metadata";
  // load the dataset entry + parse its CSV rows, then:
  // const r = getProfile(ds.profile).validate({ schema: ds.schema, rows });
  // console.log(JSON.stringify(r, null, 2));
' 2>/dev/null || echo "skip if tsx is unavailable; the build check below still covers types"
```
If validation reports `errors`, surface them (wrong type, missing required, duplicate key)
and fix the schema (e.g. relax a `type`, drop a `required`) before writing. Warnings are
advisory.

### 8. Verify the build

```bash
cd PORTAL_DIR
npx next build > /tmp/portaljs-define-schema-build.log 2>&1
BUILD_EXIT=$?
tail -20 /tmp/portaljs-define-schema-build.log
```
The common failure is malformed JSON in `datasets.json` (a stray comma) or a type that
isn't in `FieldType`. Fix and rebuild before reporting success.

### 9. Report

```
✓ Schema defined: <dataset>
  - Profile:  <profile-id> (L<level>)
  - Fields:   <n> (<list of names>)
  - Metadata: <license / sources / keywords / version that were set, or "none">
  - Manifest: datasets.json (entry updated in place)
  - Showcase: /@<namespace>/<slug> now renders a typed field table

Next: run `npm run dev` and open the showcase to see the schema table, or run
/portaljs-define-schema on the next dataset. Need machine-readable export for harvesting?
DCAT serialization is designed-in (lib/metadata/dcat.ts) and built in the DCAT-interop phase.
```

## Notes

- **One source of truth.** The schema lives on the dataset's `datasets.json` entry, read
  through the data provider unchanged — no page edits, no separate schema file (except an
  L2/L3 custom profile module in `lib/metadata`).
- **Degrades cleanly.** Every metadata field is optional; a dataset with none still lists,
  previews, and renders — the showcase just omits the schema table.
- **Frictionless-native, DCAT on top.** This authors the native model. `toDCAT`/`fromDCAT`
  in `lib/metadata/dcat.ts` are the interop layer (DCAT-AP / national / domain profiles),
  designed-in now and built in the DCAT-interop phase — don't hand-write DCAT here.
- **Backends.** A CKAN / OpenMetadata provider maps its native metadata onto these same
  fields; this skill is for the static/git-authored catalog.

## Example

```
/portaljs-define-schema population-2022
```
The skill reads `public/data/population-2022.csv`, infers fields (e.g. `country: string`,
`population: integer`), drafts titles/descriptions, asks for a license + source, writes the
schema + metadata onto the `population-2022` entry in `datasets.json` under the default
`frictionless-tabular` profile, validates it against the rows, verifies the build, and
reports the showcase URL. With no arguments it lists the datasets and asks which to describe.
