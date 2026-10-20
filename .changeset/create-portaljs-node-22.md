---
'create-portaljs': minor
---

**Requires Node.js 22 or newer.** Node 18 reached end of life on 2025-04-30, and the CLI and the scaffolded portal are now tested on Node 22 and 24 only (`engines.node` is `>=22`). On older Node, npm prints an `EBADENGINE` warning; upgrade Node to scaffold reliably.

Scaffolding now also names any skill from `.claude-plugin/plugin.json` that wasn't found at the chosen `--ref` (e.g. an older ref), instead of only reporting a smaller "Bundled N" count.
