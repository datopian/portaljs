// Single source of truth for the PortalJS skills list.
//
// The README skills table, the /docs/skills reference table, and the docs sidebar
// are all GENERATED from this array by scripts/gen-skills-docs.mjs — run
// `npm run gen:skills` after editing, and `npm run gen:skills:check` verifies they're
// in sync (used in CI). This is what keeps the README and the site from drifting.
//
// Order here is the canonical order shown everywhere (roughly the build flow:
// decide → scaffold → load data → enrich → describe → connect → validate → migrate → ship).
// `summary` is plain, reader-facing one-liner copy. Keep any `<...>` in backticks so it
// survives MDX (an un-fenced <slug> is parsed as a JSX tag and breaks the site build).

export const SKILLS = [
  {
    id: 'portaljs-architect',
    summary:
      "Advisory — turns your needs (data, scale, governance) into a recommended architecture before you build. Start here if you're unsure of the stack.",
  },
  {
    id: 'portaljs-new-portal',
    summary:
      'Scaffold a new portal (Home + Catalog + Showcase) from a brief — copies the template, substitutes your project name and description, installs deps, verifies the build.',
  },
  {
    id: 'portaljs-add-dataset',
    summary:
      'Add a CSV, TSV, JSON, or GeoJSON dataset — registers it in the catalog and renders its showcase automatically; large local files are pushed to Cloudflare R2 via Git LFS for you.',
  },
  {
    id: 'portaljs-add-resource',
    summary:
      'Attach another file (data dictionary, methodology, extra data) to an existing dataset — it becomes multi-resource and the showcase renders a section per file.',
  },
  {
    id: 'portaljs-add-chart',
    summary: "Add a line, bar, area, pie, or scatter chart to a dataset's showcase.",
  },
  {
    id: 'portaljs-add-map',
    summary: 'Render a GeoJSON dataset on an interactive map and register it on the home page.',
  },
  {
    id: 'portaljs-define-schema',
    summary:
      "Infer a Frictionless Table Schema from a dataset's data, add license/source/keyword metadata, and surface a typed field table on its showcase.",
  },
  {
    id: 'portaljs-connect-ckan',
    summary: 'Wire the portal to a CKAN backend over its API instead of static files.',
  },
  {
    id: 'portaljs-check-data-quality',
    summary:
      'Validate a dataset against its schema and flag quality issues (type mismatches, missing values, constraint violations).',
  },
  {
    id: 'portaljs-migrate',
    summary:
      'Harvest or migrate a whole catalog into the portal from CKAN, Socrata, OpenDataSoft, ArcGIS, or DCAT-US, over a canonical Frictionless/DCAT model.',
  },
  {
    id: 'portaljs-deploy',
    summary:
      'Build a static export and publish it to PortalJS Arc — Datopian-managed hosting on Cloudflare — with a live `<slug>.arc.portaljs.com` URL.',
  },
]
