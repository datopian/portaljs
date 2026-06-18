---
"create-portaljs": minor
---

Rename the agentic skill suite to a uniform `portaljs-` prefix.

All shipped skills now carry a `portaljs-` prefix — `/portaljs-new-portal`,
`/portaljs-add-dataset`, `/portaljs-add-chart`, `/portaljs-add-map`,
`/portaljs-add-resource`, `/portaljs-connect-ckan`, `/portaljs-migrate`,
`/portaljs-define-schema`, `/portaljs-architect`, `/portaljs-deploy`, and
`/portaljs-check-data-quality`. The prefix prevents collisions in Claude Code's flat
command pool (where bare names like `/deploy` and `/migrate` clash with other tools'
skills) and makes the whole suite autocomplete under `/portaljs`. Fresh scaffolds bundle
only the prefixed names.

**Back-compat:** the bare old names (`/deploy`, `/add-dataset`, …) keep working for one
minor release as thin alias stubs that forward to the prefixed skill, then are removed.
Update any scripts or docs that invoke the old names. (`/login` was already removed and
has no alias.)
