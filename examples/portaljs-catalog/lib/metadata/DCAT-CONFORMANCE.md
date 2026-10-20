# DCAT feed conformance report

External-validator pass for the `/portaljs-add-dcat` feeds (po-hqe). This is the
go-live gate for the Government-tier DCAT-AP harvesting claim: the feeds are validated
against the **official EU and US validators**, not just the internal structural check
(`dcat-validate.ts`).

**Result: the harvest gate is GREEN.** Every emitted profile conforms to DCAT-AP 3.0.1
**base** in all three serializations, and the DCAT-US feed conforms to the official
DCAT-US 3.0 SHACL shapes.

## How this was validated

- **Portal:** the reference catalog in this example (6 real datasets), config populated
  with publisher / contact / EU-vocab theme / language (the state a Gov-tier portal is in
  before claiming conformance).
- **DCAT-AP:** the EU's official ITB SHACL validator
  (`https://www.itb.ec.europa.eu/shacl/dcat-ap`, `semic-shacl` domain, DCAT-AP 3.0.1),
  over its REST API — every profile × serialization POSTed, `sh:conforms` read from the
  returned SHACL report.
- **DCAT-US:** the official
  [DCAT-US 3.0 SHACL shapes](https://raw.githubusercontent.com/DOI-DO/dcat-us/main/shacl/dcat-us_3.0_shacl_shapes.ttl)
  run locally with `pyshacl`.
- **Round-trip:** each feed harvested back through `dcat-harvest.ts` and compared to the
  source — no metadata loss on shared fields. Plus one real external DCAT-AP feed
  (SEMIC DCAT-AP example) harvested to prove `parseRdf` works on real-world RDF.

Reproduce: `tsx scripts/validate-dcat-external.ts /tmp/dcat-validation` then the ITB
REST snippet in `.claude/commands/portaljs-add-dcat.md` §8, `pyshacl` for DCAT-US, and
`tsx scripts/validate-dcat-roundtrip.ts`.

## Results

### DCAT-AP 3.0.1 **base** — the harvest gate (mandatory constraints)

| Profile | JSON-LD | Turtle | RDF/XML |
|---|---|---|---|
| `dcat-ap` | ✅ | ✅ | ✅ |
| `dcat-ap-se` | ✅ | ✅ | ✅ |
| `dcat-ap-ch` | ✅ | ✅ | ✅ |
| `dcat-ap-de` | ✅ | ✅ | ✅ |
| `dcat-3` (vs DCAT-AP base) | ✅ | ✅ | ✅ |
| `dcat-2` (vs DCAT-AP 2.1.1 base) | ✅ | ✅ | ✅ |

### DCAT-US 3.0 (official SHACL, pyshacl)

| Profile | Result |
|---|---|
| `dcat-us` | ✅ conforms |

### Round-trip (expose → harvest → compare)

| Path | Result |
|---|---|
| TTL round-trip | ✅ 6/6 datasets, no metadata loss |
| JSON-LD round-trip | ✅ 6/6 datasets, no metadata loss |
| Real external DCAT-AP feed | ✅ parsed 1 dataset / 2 distributions |

### DCAT-AP 3.0.1 **full** — advisory (base + ranges + recommendations)

`full` reports ~37 violations / ~39 warnings on the reference catalog. These are **not
harvest-blocking** — they are recommended-but-optional properties the pragmatic core
mapping doesn't carry (`dct:spatial`, `dct:temporal`, `dct:type`, `dcatap:availability`)
plus range checks the validator can't confirm because it doesn't dereference external
vocabularies in this mode (`dcat:theme` → `skos:Concept`, `dct:conformsTo` →
`dcterms:Standard`, IANA/EU media-type IRIs → `dcterms:MediaType`). A harvester accepts a
base-conformant feed; the full set is a roadmap for richer per-dataset metadata, not a
gate. See `dcat.ts` for the documented scope of the mapping.

## Conformance bugs found and fixed

The internal `dcat-validate.ts` check passed, but the feeds initially **failed the
external validators**. Two real node-kind defects were found and fixed:

1. **`dct:format` / `dcat:mediaType` emitted as string literals** (`"CSV"`, `"text/csv"`)
   → 8 base violations per feed (TTL + RDF/XML). DCAT-AP requires these to be IRIs.
   *Fix (`dcat.ts`):* emit `dct:format` as an EU file-type authority IRI and
   `dcat:mediaType` as an IANA media-type IRI; parse both back on harvest.

2. **JSON-LD `@context` never declared IRI-valued terms** — every link
   (`dcat:downloadURL`, `dct:license`, `dcat:theme`, `dct:conformsTo`, …) was a bare
   string, which JSON-LD reads as a *literal*, so the canonical `catalog.jsonld`
   autodiscovery feed failed base with 40 violations. Dates were untyped too.
   *Fix (`dcat.ts` + `dcat-profiles.ts`):* expand the context so IRI terms are
   `"@type": "@id"` and date terms are `"@type": "xsd:dateTime"`; `dcat-rdf.ts` now
   tolerates a context that mixes prefix strings with term-definition objects.

3. **`dct:publisher` was a blank node** → rejected by DCAT-US (requires an IRI-identified
   publisher). *Fix (`dcat-profiles.ts`):* mint the publisher agent with an `@id` from a
   new `publisher.uri` config field (falling back to `homepage`).

Regression guards for all three live in `scripts/harvest-roundtrip.test.ts`.

## Distributions for multi-resource datasets — #1669

Every file a dataset publishes is its own `dcat:Distribution`. Before this, only the
single-file `file` field produced one, so datasets that list their files in `resources`
(multi-file bundles, remote Parquet / PMTiles / GeoParquet) had **no distribution in any
feed** — 3 of the 7 reference datasets — tripping the DCAT-AP "distribution" check and any
profile that makes `dcat:distribution` mandatory. The mapping (`toDCAT` in `dcat.ts`):

| Source | Distribution |
|---|---|
| `file` (+ dataset `format`) | one distribution titled after the dataset — unchanged |
| each `resources[]` entry | one distribution: `dct:title` ← `title` (else `name`), `dct:description` ← `description`, `dct:format` / `dcat:mediaType` ← `format` (EU file-type / IANA IRIs, as for `file`) |
| `path` → `dcat:downloadURL` | absolute URL kept as-is (remote object storage); site-root `/x` → `<SITE_URL>/x`; bare filename → `<SITE_URL>/data/<path>` (served from `public/data/`) — the showcase's `resourceUrl()` rules (`resolveResourceUrl`) |
| `dcat:accessURL` | the dataset landing page (else the download URL) — mandatory in DCAT-AP |
| both `file` and `resources` | the file's distribution first, then the resources; a resource resolving to the file's URL is not listed twice |

On harvest, `fromDCAT` maps one distribution to `file`/`format` (as before) and two or more
to `resources[]` (full download URLs, titles, descriptions, formats), so a bundle no longer
collapses to its first file and re-exports with the same distributions. Croissant
`cr:FileObject`s resolve resource paths the same way, so a remote resource's `contentUrl` is
its own URL rather than one nested under the site's `/data/`.

Single-file datasets emit byte-identical JSON-LD (and the same RDF graph) as before.
Regression guards: `scripts/harvest-roundtrip.test.ts` (per-dataset distribution counts,
URLs and formats across every profile × serialization; `toDCAT`/`fromDCAT` unit checks) and
`scripts/validate-dcat-roundtrip.ts` (distribution counts survive the harvest round-trip).

## GeoDCAT-AP (spatial extension of DCAT-AP) — po-da5

GeoDCAT-AP IS DCAT-AP plus spatial coverage (`dct:spatial` → a `dct:Location` with
`dcat:bbox` / `locn:geometry` as `gsp:wktLiteral`, and `dcat:spatialResolutionInMeters`).
The emitted `geodcat-ap` feed passes the **DCAT-AP 3.0.1 base** harvest gate (the ITB SHACL
validator) in all three serializations — spatial coverage adds no base violations:

| Profile | JSON-LD | Turtle | RDF/XML |
|---|---|---|---|
| `geodcat-ap` (vs DCAT-AP 3.0.1 base) | ✅ | ✅ | ✅ |

Against the official [GeoDCAT-AP 3.0.0 SHACL shapes](https://semiceu.github.io/GeoDCAT-AP/releases/3.0.0/shacl/geodcat-ap-SHACL.ttl)
(`pyshacl`, the **full** profile) the feed reports the *same advisory range/recommendation
class* as DCAT-AP full — 52 violations, **none spatial**: they're external-vocabulary range
checks the validator can't confirm without dereferencing (publisher→`foaf:Agent`,
theme→`skos:Concept`, conformsTo→`dc:Standard`, media-type/format IRIs, language). The
spatial fields (`dct:spatial`, `dcat:bbox`, `gsp:wktLiteral`) draw **zero** violations. The
round-trip harness recovers `dct:spatial` back to a canonical `spatial` string.

Reproduce: `tsx scripts/validate-dcat-external.ts /tmp/dcat-validation`, then the ITB REST
snippet (§8) with `validationType: dcatap.3_0_1_base` over `geodcat-ap.ttl`, and
`pyshacl -s geodcat-ap-SHACL.ttl -df turtle -a geodcat-ap.ttl` for the full profile.

## Croissant (MLCommons / schema.org) — po-da5

The `croissant` profile emits a schema.org `DataCatalog` whose `dataset[]` are standalone
Croissant `Dataset`s (`cr:FileObject` distributions with a `sha256` hashed from the local
`public/data/<file>` bytes, and `cr:RecordSet`/`cr:Field` mapped from the Frictionless Table
Schema). JSON-LD only — Croissant is a JSON-LD vocabulary. Validated with the official
**MLCommons `mlcroissant` validator** (each `dataset[i]` extracted and validated standalone):

| Datasets | Result |
|---|---|
| 6/6 (reference catalog) | ✅ `Done.` — no errors; only recommendation warnings (`citeAs`, `datePublished`) where the source manifest omits those fields |

The `@context` matches mlcroissant's canonical Croissant 1.0 context exactly (no
"non-standard context" warning). Inbound harvest reads Croissant back through the JSON-LD
path (schema.org `@vocab`), recovering name / description / FileObject resources.

Reproduce: `pip install mlcroissant` (Python 3.10+), then for each dataset in
`croissant.jsonld` re-attach the `@context` and run `mlcroissant validate --jsonld <file>`.

## DCAT-AP_IT (Italy, AgID / dati.gov.it) — #1668

The opt-in `dcat-ap-it` profile emits the Italian national profile
([AgID guidelines](https://docs.italia.it/italia/daf/linee-guida-cataloghi-dati-dcat-ap-it/it/stabile/dcat-ap_it.html),
ontology `http://dati.gov.it/onto/dcatapit`). It builds on the DCAT-AP augmentation and
adds what AgID makes mandatory:

| Class | What the profile emits |
|---|---|
| Catalog | `dcat:Catalog` + `dcatapit:Catalog`; `dct:publisher` as a `dcatapit:Agent`; `foaf:homepage` typed `foaf:Document`; `dcat:themeTaxonomy` = the EU data-theme scheme when datasets use it |
| Dataset | `dcat:Dataset` + `dcatapit:Dataset`, with its own IRI (`<landing page>#dataset`) so the landing page can be a `foaf:Document`; `dct:identifier` = `<IPA code>:<namespace>/<slug>` (or the dataset's `dcat.identifier`); `dct:rightsHolder` (`dcat.rightsHolder`, else the dataset/catalog publisher); `dct:accrualPeriodicity` (`dcat.accrualPeriodicity`, else `accrualPeriodicity` in config, else EU frequency `UNKNOWN`, which AgID allows); `dct:modified` (the dataset's, else its issue date, else the catalog's); contact point as `dcatapit:Organization` |
| Distribution | `dcat:Distribution` + `dcatapit:Distribution`; `dct:license` on every distribution as a `dcatapit:LicenseDocument` (+ `foaf:name` and ADMS `dct:type` for recognised licences); `dct:format` mapped to an EU file-type term (PMTiles has none → `BIN`) |
| Agent | `foaf:Agent` + `dcatapit:Agent` with `dct:identifier` (from `identifier`) and `foaf:name`; identified by `uri` when set, else a blank node (never by its homepage, so the agent and the homepage document keep distinct identities) |

Inputs: `publisher.identifier` (IPA code) and EU `themes` in `dcat.config.json`; per dataset
in `datasets.json`, `dcat.rightsHolder` (`name`, `identifier`, `homepage`),
`dcat.accrualPeriodicity` and optionally `dcat.identifier`. Other profiles ignore all of
these. Enabling `dcat-ap-it` adds `catalog.dcat-ap-it.{jsonld,ttl,rdf}` and an entry in
`catalog-feeds.json`; every other feed is byte-identical with and without it.

**Validation.** Against the reference catalog with the fully populated harness config
(`scripts/validate-dcat-external.ts`, `publisher.identifier` set):

| Check | Result |
|---|---|
| AgID SPARQL rules ([italia/daf-semantic-validator](https://github.com/italia/daf-semantic-validator/tree/master/dist/data/ontologies/agid/DCAT-AP_IT/validators/sparql), 157 rules, run locally with rdflib) — Turtle, RDF/XML, JSON-LD | ✅ 0 errors; 14 warnings, all recommended properties: `dct:subject` ×7, distribution `dct:description` ×5, catalog `dct:issued` ×1, licence `dct:type` ×1 (the Natural Earth terms page is not a recognised licence) |
| [`dcat-ap-it validate`](https://github.com/ondata/dcat-ap-it-generator) (MIT, 122 rules derived from the AgID ones) — Turtle | ✅ 0 errors, 14 warnings (the same) |
| Three serializations | ✅ isomorphic graphs (364 triples each) |
| ITB DCAT-AP 3.0.1 base | the same 5 `foaf:name` violations the plain `dcat-ap` feed already reports, on the same nodes — the profile adds none |
| Round-trip (`harvest-roundtrip.test.ts`, `validate-dcat-roundtrip.ts`) | ✅ 7/7 datasets, no metadata loss on shared fields; profile detected via `dct:conformsTo` |

With the template's empty `dcat.config.json` the same rules report what a portal must
fill in (publisher with IPA code, themes, licences), matching the generator's warnings.

The hosted AgID validator (https://validatore.dati.gov.it) uploads to a session triple
store and queries it from the browser, so it was not scripted here; it runs the same
SPARQL rule set. Run it by hand on `catalog.dcat-ap-it.ttl` before registering with
dati.gov.it.

Reproduce: `tsx scripts/validate-dcat-external.ts /tmp/dcat-validation`, then run each
`.rq` file of the AgID rule directory against `/tmp/dcat-validation/dcat-ap-it.ttl` with
any SPARQL engine (e.g. `rdflib`), or `dcat-ap-it validate /tmp/dcat-validation/dcat-ap-it.ttl`.

## Still out of scope

`CKAN harvest compatibility` and `CSW` (named as epic candidates) are not implemented — the
registry is the plug point when they're prioritized.
