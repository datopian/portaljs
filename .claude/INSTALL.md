# Installing PortalJS skills

PortalJS ships a set of [Claude Code](https://docs.claude.com/en/docs/claude-code) skills
that scaffold and extend data portals: `/portaljs-new-portal`, `/portaljs-add-dataset`, `/portaljs-add-chart`,
`/portaljs-add-map`, and `/portaljs-deploy`. They run **from any project** — `/portaljs-new-portal` fetches the
template from GitHub when you're not inside a clone of this repo.

There are three ways to install them, from quickest to most integrated.

## 1. Run from a clone (no install)

If you've cloned this repo, the skills are already available inside it — Claude Code
auto-discovers `.claude/commands/`. Just open the repo and run `/portaljs-new-portal`.

## 2. Personal scope — install into `~/.claude/commands/`

Makes the skills available in **every** project on your machine.

One-liner (downloads from GitHub):

```bash
curl -fsSL https://raw.githubusercontent.com/datopian/portaljs/main/scripts/install-portaljs-skills.sh | bash
```

Or from a local clone:

```bash
./scripts/install-portaljs-skills.sh
```

The installer copies the OSS skill files into `~/.claude/commands/`. It is idempotent —
re-run it to update. Overrides:

| Env var | Default | Purpose |
|---------|---------|---------|
| `CLAUDE_COMMANDS_DIR` | `$HOME/.claude/commands` | Where to install the skills |
| `PORTALJS_SKILLS_REF` | `main` | Git ref to download from (remote mode) |

Restart Claude Code (or open a new session) and run `/portaljs-new-portal`.

## 3. Claude Code plugin

Install as a versioned, namespaced plugin from the bundled marketplace:

```
/plugin marketplace add datopian/portaljs
/plugin install portaljs@datopian-portaljs
```

Plugin commands are namespaced — run them as `/portaljs:new-portal`,
`/portaljs:add-dataset`, etc.

## Notes

- `/portaljs-new-portal` prefers a local checkout of the template when run inside this repo, and
  otherwise fetches it remotely via `npx tiged`. Override the template ref with
  `PORTALJS_TEMPLATE_REF` (default `main`). Requires **Node.js >= 18**.
- Only the OSS skills are packaged. Gas Town internal commands (`done`, `handoff`,
  `review`) are intentionally excluded.
