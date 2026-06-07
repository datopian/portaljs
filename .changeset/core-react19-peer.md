---
"@portaljs/core": patch
---

Widen peer dependencies so the package installs on the modern stack without `--legacy-peer-deps`: `react`/`react-dom` now allow `^19` (in addition to `^18`), and `next` is `>=13.2.1` (allowing Next 14–16).
