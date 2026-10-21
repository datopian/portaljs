---
'create-portaljs': patch
---

Upgrade `giget` from 1.x to ^3.3.1. giget 1.x extracts the template with `tar@6`, which has unpatched path-traversal / symlink advisories (including a critical one); giget 3.3.1 bundles a patched `tar@7`. The `downloadTemplate` API used by the CLI is unchanged and the scaffolded project is byte-identical.
