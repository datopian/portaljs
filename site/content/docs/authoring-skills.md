---
metatitle: Authoring PortalJS Skills – Write Your Own Agentic Command
metadescription: Write your own PortalJS skill. Skills are markdown files in .claude/commands — document required input, describe output, handle errors with the ERROR format, and test end to end.
title: Authoring skills
description: Write your own agentic command. Skills are markdown files with a clear input contract, described output, and structured errors.
---

PortalJS skills are designed to be extended — anyone can write a new one. A skill is
just a **markdown file**, so authoring one is mostly writing clear instructions, not
code. This page summarizes the conventions; the full reference is the
[authoring guide](https://github.com/datopian/portaljs/blob/main/.claude/AUTHORING.md)
in the repo.

## Where skills live

- `.claude/commands/` — open-source skills (no Datopian keys required). The filename
  becomes the slash command, so `add-dataset.md` → `/portaljs-add-dataset`.
- `.claude/datopian/` — Datopian-internal skills that need API access. These carry a
  header marking them internal and aren't for general OSS use.

## File format

Each skill is a markdown file with frontmatter and a body:

```markdown
---
description: One sentence shown in /help and the command picker
allowed-tools: Read, Write, Edit, Bash, WebFetch
---

# /skill-name

One paragraph: what this skill does and when to use it.

## Required input
…

## Steps
…
```

Frontmatter fields:

- `description` (**required**) — shown in `/help`.
- `allowed-tools` (optional) — restricts which tools the assistant may call.

## The input contract

Every skill documents the **minimum required input** before doing any work:

- At least one identifying noun (project name, file path, dataset name).
- If a file path or URL is required, **state the supported formats explicitly**.

**Prompting rule:** if required input is missing, emit one clarifying question and
**stop** — don't guess, and don't proceed with placeholder values.

## Describe the output

Every skill says what it produces: files created (paths, formats), files modified
(what changes), commands run (and expected exit codes), and what the user sees on
success.

## Handle errors with the `ERROR:` format

On any hard failure, emit a structured block and stop — never continue silently past a
failure:

```
ERROR: [SKILL_NAME] [CODE] <message> — <remediation hint>
```

For example:

```
ERROR: [add-dataset] UNSUPPORTED_FORMAT .xlsx files are not supported — convert to CSV first.
```

## Composing skills

In v1, skills are user-invoked and don't call each other programmatically. If a skill's
output is the natural input to another, point there at the end:

```
Done. Next: run /portaljs-add-dataset to load a CSV into this portal.
```

## Definition of done

A skill is done when it: (1) has frontmatter with `description`; (2) documents required
input and supported formats; (3) describes its output; (4) uses the `ERROR:` format for
failures; (5) has been tested end to end on at least one **real** project; and (6) ends
with a "next step" pointer if another skill naturally follows.

> [!note] Editing the template vs. editing the skill
> When you change *page layouts, styles, or component usage*, edit the
> [template](/docs/templates) files directly — `/portaljs-new-portal` picks them up
> automatically. Only edit a skill file when you change *how* the skill works (its
> steps, error handling, or argument parsing).

## Where to go next

- **[Skills reference](/docs/skills)** — the full skill suite to model yours on.
- **[The PortalJS vision](https://github.com/datopian/portaljs/blob/main/VISION.md)** —
  the roadmap of upcoming skill families.

<DocsPagination prev="/docs/templates" next="/docs/backends" />
