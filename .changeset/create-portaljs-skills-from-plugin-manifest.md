---
'create-portaljs': patch
---

Bundle every shipped skill into scaffolds, including `/portaljs-add-geo`, `/portaljs-add-dcat`, and `/arcgis-to-portaljs`, which were missing from the hard-coded allowlist. The list of skills to bundle is now read from the repo's `.claude-plugin/plugin.json` at the same `--ref` as the template, so the scaffold always ships exactly what the plugin ships. A built-in list (now complete) is used only if that file can't be fetched.
