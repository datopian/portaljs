# PortalJS skill-suite naming audit

**Status:** inventory + recommendation (no renames performed — see bead `po-ok8`).
**Scope:** the OSS agentic skills PortalJS ships into a user's Claude Code skill
namespace. Gas Town internal commands (`done`, `handoff`, `review`) are excluded —
they are not shipped (see `scripts/install-portaljs-skills.sh` and `.claude-plugin/plugin.json`).
**Decision owners:** Anu / Joao. **STOP at the recommendation** — the actual rename is a
follow-up bead.

## The problem in one line

A shipped skill installs into a *global, flat* command pool alongside skills from every
other tool the user has (`gh`, `vercel`, `gstack`, …). The skill **name** is the only
signal of (a) what it does and (b) whose it is. Most current names answer neither.

---

## 1. Inventory

The 12 skills in `.claude-plugin/plugin.json` (`login` is being removed in `po-b7f`, so it
gets no proposed name). Collision risk = how likely another tool already owns that verb in
the flat namespace.

| Skill | Risk | Reasoning — who else commonly owns this verb |
|-------|------|----------------------------------------------|
| `deploy` | **HIGH** | Universal. Vercel, Netlify, wrangler, fly, sst, k8s, every CI tool ships a `deploy`. Guaranteed collision. |
| `migrate` | **HIGH** | Owned by DB/ORM tooling — Prisma, Rails, Django, Alembic, Flyway, golang-migrate. A data person almost certainly has another `/migrate`. Worse: *semantic* collision — ours harvests datasets, theirs alters schemas. |
| `architect` | **HIGH** | Generic advisory verb; AWS, infra-as-code, and assorted "architecture advisor" skills claim it. Says nothing about data portals. |
| `add-resource` | **HIGH** | `resource` is one of the most overloaded nouns in tech — Terraform, k8s, REST/CRUD, RBAC. Bare `/add-resource` reads as infra, not "add a file to a dataset." |
| `add-dataset` | **MED** | `add-*` is a generic verb pattern; `dataset` is data-flavored but ML/BI tools (HuggingFace, BigQuery, Kaggle CLIs) also "add datasets." Ambiguous, not exclusive. |
| `define-schema` | **MED** | `schema` is owned by GraphQL, JSON Schema, DB DDL, Avro/Protobuf tooling. "define-schema" could be any of them. |
| `add-chart` | **MED** | Ambiguous noun: Helm **charts** (k8s) vs. data **charts** (viz). A k8s user reads `/add-chart` as Helm. |
| `add-map` | **MED** | `map` is overloaded (data structure vs. geographic map) and `add-*` is generic. Lower install-base overlap than `chart` but still ambiguous. |
| `new-portal` | **MED** | "portal" is generic enterprise-speak (auth portals, customer portals). Doesn't signal *data* or *PortalJS*. `new-*` is a generic scaffolder verb. |
| `check-data-quality` | **LOW** | Long, specific phrasing; `check-*` is generic but the full name is descriptive and unlikely to be owned elsewhere. |
| `connect-ckan` | **LOW** | `ckan` is a product-specific proper noun. Self-identifying, near-zero collision. The model others should follow. |
| `login` | — | **Removed in `po-b7f`. No name proposed.** (Would have been HIGH — every tool has auth.) |

**Pattern:** the two safe names (`connect-ckan`, `check-data-quality`) earn safety from a
product noun or a long descriptive phrase. Every generic-verb name is at risk.

---

## 2. Harness capability check — what namespacing is actually possible

Verified against current Claude Code docs (`custom-skills.md`, `plugins-reference.md`) and
this repo's three install channels.

**Claude Code has exactly one namespacing mechanism: the plugin prefix.**

| Channel | How PortalJS uses it | Invocation | Namespaced? |
|---------|----------------------|------------|-------------|
| **Plugin** | `.claude-plugin/` marketplace + `plugin.json`; install via `/plugin install portaljs@datopian-portaljs` | `/portaljs:deploy` | **YES** — mandatory, immutable `plugin-name:` prefix. *Cannot* collide with anything. |
| **Personal** | `scripts/install-portaljs-skills.sh` copies files into `~/.claude/commands/` | `/deploy` | **NO** — flat, shared pool. |
| **Project (bundled)** | `create-portaljs` bundles skills into the scaffold's `.claude/commands/` (CHANGELOG #1571) | `/deploy` | **NO** — flat, shared pool. |

Hard facts that constrain the options:

- **Subdirectories do NOT namespace.** A file at `.claude/commands/portaljs/deploy.md` is
  still invoked `/deploy`. Subdirs are purely organizational. (One exception: the harness
  *auto*-namespaces a same-named skill found at a more-nested project path as
  `/<path>:name` — but that is automatic clash-handling, not a convention we can opt into.)
- **There is no opt-in prefix for non-plugin skills.** Project/personal/bundled skills
  share one flat pool. Collisions resolve only by precedence
  (enterprise > personal > project > bundled) — i.e. one skill silently *shadows* the other.
- **The filename is the command name across all three channels.** We cannot ship one
  surface name to plugin users and a different one to flat-install users without shipping
  different files.

**Consequence:** the plugin channel is already collision-proof and produces good
`/portaljs:*` names for free. The damage is entirely in the two *flat* channels — and those
are the zero-friction defaults we actively promote (the install one-liner and the
"skills travel with the scaffold" UX). The harness will not fix this for the flat channels;
**only a naming convention can.**

---

## 3. Convention options with tradeoffs

The unavoidable tension: **one filename → one command name in every channel.** Any prefix
we add to fix the flat channels also lands in the plugin channel as a redundant
double-prefix (`/portaljs:portaljs-deploy`).

### Option A — Keep short names; make the plugin the only supported channel
Deprecate the install-script and the `create-portaljs` bundling; tell everyone to
`/plugin install`. Names stay clean (`/portaljs:deploy`) and collision-proof.
- ➕ Best end-state names; zero redundancy; harness does the work.
- ➖ Kills the two lowest-friction install paths — including the marquee
  "skills ship with your new portal" feature (#1571). Plugin install is more steps and
  less discoverable. High adoption cost; regresses DX we just built.

### Option B — Uniform flat prefix: `portaljs-<verb>` for every skill
`portaljs-deploy`, `portaljs-add-chart`, … applied to all 11.
- ➕ Fixes **every** flat-channel collision. Uniform and predictable. Typing `/portaljs`
  + Tab autocompletes the whole suite in flat channels — replicating the discoverability
  the plugin colon gives for free. Owner is always legible.
- ➕ Works identically in all three channels without deprecating any.
- ➖ Verbose. Plugin users get the ugly double-prefix `/portaljs:portaljs-deploy`.
- ➖ Re-prefixes already-safe names (`connect-ckan` → `portaljs-connect-ckan`), which is
  redundant signal.

### Option C — Selective prefix: prefix the generic verbs, keep product-specific names short
`portaljs-deploy`, `portaljs-migrate`, … but keep `connect-ckan`, `check-data-quality`.
- ➕ Fixes the real collisions (HIGH/MED) with the least verbosity. Honors the principle
  that a product noun already self-identifies.
- ➖ Inconsistent surface — the suite is a mix of prefixed and bare names; users can't
  predict which is which, and `/portaljs`-Tab discovery is incomplete.
- ➖ "Generic enough to prefix?" is a judgement call relitigated on every new skill.

---

## 4. Recommendation

**Adopt Option B — a uniform `portaljs-` prefix on all shipped skills — and keep all three
install channels.**

Rationale:

1. **The flat channels are the default, not the edge case.** The install one-liner and the
   `create-portaljs` bundle are what we actively push. They are exactly the channels with no
   harness protection, so the fix must live in the name. Option A throws away that DX to get
   clean names; not worth it.
2. **Uniformity buys discoverability.** A consistent `portaljs-` prefix makes `/portaljs`+Tab
   surface the entire suite in the flat channels — the same affordance plugin users get from
   the `portaljs:` colon. Selective prefixing (C) forfeits this and adds a permanent
   "is this one generic enough?" debate.
3. **Predictability beats brevity** for a 11-skill suite a user touches occasionally. Two
   extra syllables is a small, one-time cost; a silently-shadowed `/deploy` is a confusing,
   recurring one.
4. The known wart — plugin users see `/portaljs:portaljs-deploy` — is cosmetic, affects the
   *protected* minority channel, and still works. If the plugin ever becomes the sole
   channel, dropping the redundant filename prefix is a clean future step.

### Proposed rename map (old → new)

| Old | New |
|-----|-----|
| `architect` | `portaljs-architect` |
| `new-portal` | `portaljs-new-portal` |
| `add-dataset` | `portaljs-add-dataset` |
| `add-resource` | `portaljs-add-resource` |
| `add-chart` | `portaljs-add-chart` |
| `add-map` | `portaljs-add-map` |
| `connect-ckan` | `portaljs-connect-ckan` |
| `migrate` | `portaljs-migrate` |
| `define-schema` | `portaljs-define-schema` |
| `deploy` | `portaljs-deploy` |
| `check-data-quality` | `portaljs-check-data-quality` |
| `login` | — *(removed in `po-b7f`; do not rename)* |

*(If reviewers prefer less verbosity over uniformity, the fallback is Option C: apply the
prefix only to the HIGH/MED rows above and leave `connect-ckan` + `check-data-quality`
short.)*

### Migration sketch

1. **Rename the files** in `.claude/commands/`. The filename *is* the command name, so this
   is the whole rename. Update the `# /name` heading inside each file's body to match.
2. **Back-compat window (one minor release).** Keep the old-named files as thin alias stubs
   that point to the new skill (frontmatter `description: "Renamed → /portaljs-deploy"` and a
   body line telling the model/user to invoke the new name). Remove the stubs in the next
   minor.
3. **Update the four places that enumerate skill names** (keep them in sync — they already
   drift):
   - `.claude-plugin/plugin.json` `commands[]`
   - `scripts/install-portaljs-skills.sh` `SKILLS=` list
   - `create-portaljs` (`index.mjs` help banner ~L358, `README.md`, `SPEC.md`) and its skill
     prune-allowlist
   - `.claude/INSTALL.md`, `.claude/AUTHORING.md`, root `CLAUDE.md` skills section, and
     `packages/create-portaljs/CHANGELOG.md` examples
4. **Changeset.** Add a `create-portaljs` changeset (the scaffold bundles the skills, so the
   rename is user-visible) describing the new names and the alias window.
5. **Adopter comms.** Note in release notes + the marketplace plugin description that
   `/foo` → `/portaljs-foo`; aliases bridge one release.
6. **Coordinate with `po-b7f`** — `login` is going away; do not ship an alias or a new name
   for it.

---

## Appendix — sources

- `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` — shipped command list, plugin name `portaljs`.
- `.claude/INSTALL.md` — three install channels; documents `/portaljs:new-portal` for the plugin path.
- `scripts/install-portaljs-skills.sh` — flat copy into `~/.claude/commands/`.
- `packages/create-portaljs/` (`CHANGELOG.md` #1571, `index.mjs`, `README.md`, `SPEC.md`) — flat bundle into scaffold `.claude/commands/`.
- Claude Code docs `custom-skills.md` / `plugins-reference.md` — flat pool for project/personal/bundled; mandatory `plugin-name:` prefix for plugins; subdirectories do not namespace; no opt-in prefix for non-plugin skills.
