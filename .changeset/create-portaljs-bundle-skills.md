---
'create-portaljs': minor
---

Bundle the PortalJS agentic skills into the scaffolded project's `.claude/commands/`. The skills now travel with the new portal — running `claude` in the project directory picks up `/add-dataset`, `/connect-ckan`, `/deploy`, etc. immediately, with no separate global install. Skills are fetched at the same template ref as the scaffold (so they match) and pruned to the OSS allowlist; a fetch failure is non-fatal and prints the manual install one-liner.
