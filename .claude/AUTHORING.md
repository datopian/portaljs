# PortalJS Skill Authoring Guide

Skills live in `.claude/commands/` (OSS, no Datopian keys required) or `.claude/datopian/` (Datopian-internal, requires API access).

## File format

Each skill is a markdown file. The filename becomes the slash command.

```markdown
---
description: One sentence shown in /help and command picker
allowed-tools: Read, Write, Edit, Bash, WebFetch
---

# /skill-name

One paragraph explaining what this skill does and when to use it.

## Required input

...

## Steps

...
```

Frontmatter fields:
- `description` (required) — shown in `/help`
- `allowed-tools` (optional) — restricts which tools Claude may call

## Input contract

Every skill must document the minimum required input before doing any work.

**Minimum required fields** (must be present or the skill must prompt before proceeding):
- At minimum: one identifying noun (project name, file path, dataset name)
- If a file path or URL is required: state the supported formats explicitly

**Prompting rule:** If required input is absent, emit one clarifying question and stop. Do not guess. Do not proceed with placeholder values.

Example prompt pattern:
```
I need a dataset file path or URL to continue. Please provide one of:
- A local file path: ./data/myfile.csv
- A public URL: https://example.com/data.csv
```

## Output expectations

Every skill must describe what it produces:
- Files created (paths, formats)
- Files modified (paths, what changes)
- Commands run (and expected exit codes)
- What the user sees when it succeeds

## Error handling

On any hard failure, emit a structured error block and stop:

```
ERROR: [SKILL_NAME] [CODE] <message> — <remediation hint>
```

Examples:
```
ERROR: [new-portal] MISSING_INPUT No project name provided — add a name to your brief and retry.
ERROR: [add-dataset] UNSUPPORTED_FORMAT .xlsx files are not supported — convert to CSV first.
ERROR: [add-dataset] FETCH_FAILED Could not fetch https://... — check the URL is publicly accessible.
```

Do not silently continue past a hard failure. Do not use placeholder values to paper over missing input.

## Referencing other skills

In v1, skills are user-invoked and do not call each other programmatically. If a skill's output is the natural input to another skill, say so at the end:

```
Done. Next: run /portaljs-add-dataset to load your client's CSV into this portal.
```

## Datopian-internal skills

Any skill in `.claude/datopian/` must include this header immediately after the title:

```
> Datopian-internal skill. Requires Datopian API access. Not for general OSS use.
```

## Definition of done

A skill is done when:
1. It has frontmatter with `description`
2. It documents required input and supported formats
3. It describes its output
4. It uses the `ERROR:` format for failures
5. It has been tested end-to-end on at least one real project (not a toy example)
6. It ends with a "next step" pointer if another skill naturally follows
