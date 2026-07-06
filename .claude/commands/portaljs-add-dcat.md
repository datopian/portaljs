---
description: Make a PortalJS portal harvestable by national/EU/US open-data portals — emit standards-compliant DCAT catalog feeds (DCAT 2/3, DCAT-AP, DCAT-US, national profiles) in JSON-LD, Turtle, and RDF/XML at build, with autodiscovery and per-profile conformance checking.
allowed-tools: Read, Write, Edit, Bash, WebFetch
---

# /portaljs-add-dcat

Turn an existing PortalJS (`portaljs-catalog`) portal into a **harvestable** data
catalog: emit standards-compliant **DCAT** metadata feeds so external catalogs and
government data portals (data.europa.eu, data.gov, national portals) can harvest its
datasets automatically.

PortalJS is Frictionless-native (a dataset is a Data Package — see
`/portaljs-define-schema`); **DCAT is the serialization + harvest layer on top**
(`lib/metadata/dcat.ts` + `lib/metadata/dcat-profiles.ts`). This skill selects one or
more DCAT **application profiles**, maps every dataset's metadata to them, and writes
static feed files at build so they harvest on **any** host (static Cloudflare Pages, a
CDN, a Worker) — no runtime.

## What it produces

Wired into `predev`/`prebuild` via `scripts/generate-dcat.ts`, so the feeds are always
fresh:

| File | What |
|------|------|
| `public/catalog.jsonld` · `catalog.ttl` · `catalog.rdf` | **Canonical** feed (first profile) in JSON-LD, Turtle, RDF/XML — the stable autodiscovery targets |
| `public/catalog.<profile>.{jsonld,ttl,rdf}` | One feed per configured profile × serialization (e.g. `catalog.dcat-ap.ttl`) |
| `public/catalog-feeds.json` | Machine-readable index of every emitted feed |
| `<link rel="alternate" type="application/ld+json" href="/catalog.jsonld">` in `_document.tsx` | Autodiscovery — how harvesters find the feed |

Config lives in **`dcat.config.json`** at the portal root (created/updated by this
skill). All feeds regenerate from `datasets.json` + this config.

## Supported profiles

Profiles are a **pluggable registry** (`lib/metadata/dcat-profiles.ts`) — national
profiles are config/data, not hardcoded, and multiple can be emitted at once.

| id | Profile | Notes |
|----|---------|-------|
| `dcat-3` | DCAT 3 (W3C) | Default. `conformsTo` DCAT-3. |
| `dcat-2` | DCAT 2 (W3C) | Same core subset stamped as DCAT-2. |
| `dcat-ap` | DCAT-AP (data.europa.eu) | EU profile: adds foaf/vcard, publisher, contactPoint, `dcat:theme` (EU data-theme vocab). |
| `dcat-us` | DCAT-US 3.0 (data.gov) | US federal / Project Open Data: adds publisher, contactPoint, `dct:accessLevel`. |
| `geodcat-ap` | GeoDCAT-AP (spatial / INSPIRE) | DCAT-AP + spatial coverage: `dct:spatial` (bbox/geometry as `gsp:wktLiteral`) + `dcat:spatialResolutionInMeters` from each dataset's `dcat.spatial` (or the catalog-wide `spatial` config). |
| `croissant` | Croissant (MLCommons / schema.org) | ML-dataset metadata: a schema.org `DataCatalog` of Croissant `Dataset`s with `cr:FileObject` distributions + `cr:RecordSet`/`cr:Field` mapped from the Frictionless Table Schema. **JSON-LD only.** |
| `dcat-ap-se` · `dcat-ap-ch` · `dcat-ap-de` | National (Sweden / Switzerland / Germany) | DCAT-AP + national `conformsTo`; examples of the plug mechanism. |

**Add another national profile** without code: `registerDcatProfile(makeNationalProfile({ id, label, conformsTo, context }))` in a small module the app loads, then list its id in `dcat.config.json`. See `lib/metadata/README.md`.

**GeoDCAT-AP spatial input.** Per dataset, add `"dcat": { "spatial": { "bbox": "POLYGON((…))" } }` (or `"geometry"`, `"uri"`, `"spatialResolutionInMeters"`) to `datasets.json`; or set a catalog-wide `"spatial"` in `dcat.config.json`. WKT strings are serialized as `gsp:wktLiteral`. A dataset with no spatial coverage is still GeoDCAT-AP-conformant.

**Croissant** describes datasets for ML tooling (schema.org JSON-LD). It reads the Frictionless Table Schema to emit `cr:RecordSet`/`cr:Field`, and stamps a `sha256` on each `cr:FileObject` from the local `public/data/<file>` bytes (mlcroissant requires a checksum on a hosted file; remote-only files are emitted without one). Because a Croissant document describes a single dataset, the feed is a `DataCatalog` whose `dataset[]` entries are each a standalone Croissant `Dataset`.

## Required input — ask, don't error

- **Portal directory** — path to the portal project (defaults to current directory).
- **Profiles** — which to emit (default: `dcat-3`). For national-portal harvesting the
  user wants `dcat-ap` (EU) or `dcat-us` (US) + optionally a national profile.
- **Publisher + contact** — DCAT-AP and DCAT-US **require** `dct:publisher` and
  `dcat:contactPoint`. If the user picks one of those profiles, ask for the publishing
  organization (name + homepage) and a contact (name + email). Without them the feed is
  emitted but **fails conformance** — the generator will say what's missing.
- **Site URL** — the portal's public origin (e.g. `https://data.example.org`), so feed
  links are absolute. Without it links are root-relative (fine only for same-origin
  harvest). Reuse `SITE_URL` if already set for `/portaljs-deploy`.

If profiles beyond `dcat-3` are chosen and publisher/contact are missing, ask (one
focused prompt) and wait:
```
DCAT-AP / DCAT-US require a publisher and a contact point. I need:
1. Publishing organization: name + homepage URL
2. Contact: name + email
3. Public site URL (Enter to use root-relative links)
You can say "skip" to emit the feed anyway — it will be flagged as non-conformant.
```

## Steps

### 1. Gather input from `$ARGUMENTS` (interview if thin)

Extract: `PORTAL_DIR` (default `.`), `PROFILES` (default `["dcat-3"]`),
`SITE_URL`, `PUBLISHER` (name/homepage), `CONTACT` (fn/email), `LICENSE` (default
dataset license URI), `THEMES` (EU data-theme URIs), `LANGUAGES`, `ACCESS_LEVEL`
(DCAT-US, default `public`).

### 2. Validate the portal directory

Confirm `PORTAL_DIR/datasets.json`, `PORTAL_DIR/package.json`, and
`PORTAL_DIR/lib/metadata/` exist. If `lib/metadata/` is missing, the portal predates the
metadata contract — tell the user and stop with an `ERROR:` (this skill builds on it).

### 3. Ensure the DCAT profile layer is present

Newer scaffolds already ship it. For a portal scaffolded before this skill, check for and
create the modules (copy the canonical versions from `examples/portaljs-catalog` if you
have the repo, else write them):
- `PORTAL_DIR/lib/metadata/dcat-profiles.ts` — the profile registry + `apply()`.
- `PORTAL_DIR/lib/metadata/dcat-rdf.ts` — Turtle + RDF/XML serializers.
- `PORTAL_DIR/lib/metadata/dcat-validate.ts` — per-profile mandatory-field check.
- Ensure `PORTAL_DIR/lib/metadata/index.ts` re-exports them (`getDcatProfile`,
  `serialize`, `validateDcat`, `type DcatConfig`, `type RdfFormat`, `type JsonLdNode`).

`lib/metadata/dcat.ts` (the DCAT-3 core) must already exist — it's the base the profiles
augment. If it's missing, the portal predates DCAT interop; stop with an `ERROR:`.

### 4. Ensure the multi-profile generator is wired

`PORTAL_DIR/scripts/generate-dcat.ts` must read `dcat.config.json` and emit per-profile ×
serialization feeds (the version in `examples/portaljs-catalog/scripts/generate-dcat.ts`).
If the portal has the old single-file generator (writes only `catalog.jsonld`), replace it
with the multi-profile version. Confirm `package.json` has:
```json
"generate:dcat": "tsx scripts/generate-dcat.ts",
"predev": "npm run generate:dcat",
"prebuild": "npm run generate:dcat"
```
Add `tsx` to `devDependencies` if absent.

### 5. Write `dcat.config.json`

Create/update `PORTAL_DIR/dcat.config.json` with the gathered input. Only include
non-empty fields:
```json
{
  "profiles": ["dcat-ap", "dcat-us"],
  "serializations": ["jsonld", "ttl", "rdf"],
  "title": "<catalog title>",
  "description": "<catalog description>",
  "publisher": { "name": "<org>", "homepage": "<url>" },
  "contactPoint": { "fn": "<name>", "email": "<email>" },
  "license": "<default license URI>",
  "themes": ["http://publications.europa.eu/resource/authority/data-theme/GOVE"],
  "languages": ["http://publications.europa.eu/resource/authority/language/ENG"],
  "homepage": "<portal homepage>",
  "accessLevel": "public"
}
```
- `profiles` — the ids from Step 1 (order matters: the **first** profile also gets the
  canonical un-suffixed `catalog.jsonld`/`.ttl`/`.rdf`).
- Drop `publisher`/`contactPoint` only if the user said "skip" (feed will be
  non-conformant for AP/US).
- `themes` should be from the EU data-theme vocabulary for DCAT-AP; per-dataset themes
  can override via a dataset's optional `dcat` field in `datasets.json`.

### 6. Add feed autodiscovery

Ensure `PORTAL_DIR/pages/_document.tsx` `<Head>` contains:
```tsx
<link rel="alternate" type="application/ld+json" href="/catalog.jsonld" title="DCAT catalog feed" />
```
Add it if missing. This is how harvesters discover the feed from any page.

### 7. Generate the feeds and check conformance

```bash
cd PORTAL_DIR
SITE_URL="<site url>" npm run generate:dcat 2>&1 | tee /tmp/portaljs-dcat.log
```
The generator prints per-profile **conformance errors** (missing mandatory fields).
If any appear, surface them and offer to fill the gap in `dcat.config.json` (usually
`publisher`/`contactPoint`) before continuing.

### 8. Verify — parse the RDF and (optionally) validate against SHACL

**Always** confirm the emitted RDF is well-formed and the three serializations agree.
The feeds must parse and yield the same triples in JSON-LD, Turtle, and RDF/XML:
```bash
cd PORTAL_DIR
# Quick structural check: valid JSON-LD + non-empty feeds.
node -e "for (const f of require('fs').readdirSync('public').filter(x=>x.endsWith('.jsonld')&&x.startsWith('catalog'))) { JSON.parse(require('fs').readFileSync('public/'+f,'utf8')); console.log('✓ '+f) }"
```
For a rigorous cross-serialization check (recommended, in a scratch dir — do **not** add
to the portal's deps): `npm i n3 rdfxml-streaming-parser jsonld`, parse each
`catalog.*.ttl` (n3), `catalog.*.rdf` (rdfxml-streaming-parser) and `catalog.*.jsonld`
(jsonld → n-quads), and assert the triple counts match per profile.

**Authoritative profile validation (SHACL).** For DCAT-AP/DCAT-US conformance, validate
against the official SHACL shapes or the hosted validators — report the result, don't
claim conformance without it. The built-in feeds are validated conformant to **DCAT-AP
3.0.1 base** (the harvest gate) in all three serializations and **DCAT-US 3.0 SHACL**;
re-run these after changing the mapping:
- **DCAT-AP** — the EU's official ITB SHACL validator has a REST API (no browser). POST
  the RDF and read `sh:conforms`. `base` is the mandatory harvest gate; `full` adds
  ranges + recommendations (advisory — expect range warnings the validator can't
  dereference for external vocabularies):
  ```bash
  curl -s https://www.itb.ec.europa.eu/shacl/dcat-ap/api/validate \
    -H 'Content-Type: application/json' -H 'Accept: application/ld+json' \
    -d "$(python3 -c 'import json,sys;print(json.dumps({"contentToValidate":open("public/catalog.dcat-ap.ttl").read(),"embeddingMethod":"STRING","contentSyntax":"text/turtle","validationType":"dcatap.3_0_1_base"}))')" \
    | python3 -c 'import sys,json;g=json.load(sys.stdin);print([n["sh:conforms"] for n in g.get("@graph",[g]) if "sh:conforms" in n])'
  ```
  (validation types from `.../shacl/dcat-ap/api/info`; also usable offline via
  `pip install pyshacl` + the [DCAT-AP SHACL shapes](https://github.com/SEMICeu/DCAT-AP/tree/master/releases)).
- **DCAT-US** — `pip install pyshacl` + the official
  [DCAT-US 3.0 SHACL shapes](https://raw.githubusercontent.com/DOI-DO/dcat-us/main/shacl/dcat-us_3.0_shacl_shapes.ttl):
  `pyshacl -s dcat-us_3.0_shacl_shapes.ttl -a public/catalog.dcat-us.ttl`. DCAT-US
  **requires an IRI-identified `dct:publisher`** — set `publisher.uri` (or `homepage`)
  in `dcat.config.json`, else a blank-node publisher is rejected.
- **GeoDCAT-AP** — validates as DCAT-AP for the harvest gate (`validationType`
  `dcatap.3_0_1_base` on the ITB endpoint above, over `public/catalog.geodcat-ap.ttl`).
  For the full spatial profile use the official
  [GeoDCAT-AP 3.0.0 SHACL shapes](https://semiceu.github.io/GeoDCAT-AP/releases/3.0.0/shacl/geodcat-ap-SHACL.ttl):
  `pyshacl -s geodcat-ap-SHACL.ttl -df turtle -a public/catalog.geodcat-ap.ttl` — like
  DCAT-AP `full`, expect advisory range violations (publisher→`foaf:Agent`,
  theme→`skos:Concept`, …) the validator can't confirm without dereferencing external
  vocabularies; run with `-i rdfs` to clear the subclass ones.
- **Croissant** — the MLCommons validator (Python 3.10+): `pip install mlcroissant`,
  then validate each dataset (the feed is a `DataCatalog`; extract each `dataset[i]`,
  re-attach the shared `@context`, and run `mlcroissant validate --jsonld <file>`).
  Recommendation-level warnings (`citeAs`, `datePublished`) are expected where the
  source manifest omits those fields.

Two things the mapping gets right for node-kind conformance (don't regress them): links
(`dcat:downloadURL`, `dct:license`, `dcat:theme`, …) are IRIs — in JSON-LD they are typed
`"@type": "@id"` in the `@context`, not bare strings; and `dct:format` / `dcat:mediaType`
are emitted as IRIs (EU file-type authority + IANA media-type URIs), not the literals
`"CSV"` / `"text/csv"`. Date values (`dct:issued/modified/created`) must be full
`xsd:dateTime` timestamps.

If `pyshacl` and network are both unavailable, say so and give the validator URL rather
than skipping silently.

### 9. Verify the build

```bash
cd PORTAL_DIR
npx next build > /tmp/portaljs-dcat-build.log 2>&1; echo "exit: $?"
tail -20 /tmp/portaljs-dcat-build.log
```
The common failure is malformed JSON in `dcat.config.json` or `datasets.json`. Fix and
rebuild before reporting success.

### 10. Report

```
✓ DCAT feeds enabled: <n> profile(s) [<ids>] × [<serializations>]
  - Profiles:   <dcat-ap (data.europa.eu), dcat-us (data.gov), ...>
  - Feeds:      public/catalog.<profile>.{jsonld,ttl,rdf}  (+ canonical catalog.jsonld/.ttl/.rdf)
  - Index:      public/catalog-feeds.json
  - Discovery:  <link rel="alternate"> in _document.tsx → /catalog.jsonld
  - Conformance: <clean | N mandatory fields missing — listed above>
  - Config:     dcat.config.json
  - Regenerates on predev/prebuild; harvests statically (no runtime).

Next: register your portal with the harvester (data.europa.eu / your national portal /
data.gov) pointing at <SITE_URL>/catalog.jsonld (or the profile-specific feed). Run
/portaljs-deploy to publish. Add per-dataset schema/metadata with /portaljs-define-schema
to enrich the feed.
```

## Error handling

```
ERROR: [add-dcat] NO_METADATA_CONTRACT lib/metadata/ not found — this portal predates the metadata-profile contract. Scaffold with /portaljs-new-portal or add lib/metadata first.
ERROR: [add-dcat] NO_DCAT_CORE lib/metadata/dcat.ts not found — the DCAT-3 core is missing. Update the portal template before adding profiles.
ERROR: [add-dcat] BAD_CONFIG dcat.config.json is not valid JSON — fix the syntax and re-run.
ERROR: [add-dcat] UNKNOWN_PROFILE "<id>" is not a registered profile — use one of dcat-2, dcat-3, dcat-ap, dcat-us, geodcat-ap, croissant, dcat-ap-se, dcat-ap-ch, dcat-ap-de, or register a national profile first.
```

## Notes

- **Frictionless-native, DCAT on top.** This never forks the native model — profiles
  post-process the DCAT-3 catalog `dcat.ts` produces. Author dataset metadata with
  `/portaljs-define-schema`; this maps it out for harvest.
- **Honest conformance.** The generator emits the feed even when mandatory fields are
  missing, but **warns** exactly what's absent — it never silently claims conformance.
  Fill `publisher`/`contactPoint` for AP/US.
- **Multiple profiles at once.** A portal that needs both EU and a national extension
  lists both in `profiles`; each gets its own feed files.
- **Generated, not committed.** The feeds are build artifacts (gitignored); only
  `dcat.config.json` is committed. They regenerate on every `predev`/`prebuild`.
- **Static harvest.** Because the feeds are plain files, harvesting needs no server —
  the same reason the rest of the portal deploys statically.
