---
description: Scaffold a new PortalJS data portal from a brief. Copies the canonical template from examples/portaljs-template and substitutes project tokens.
allowed-tools: Read, Write, Edit, Bash
---

# /new-portal

Scaffold a production-ready PortalJS data portal from a client brief. Copies `examples/portaljs-template`, substitutes placeholder tokens, installs dependencies, and verifies the build.

## Required input

The brief must include at minimum:
- A **project name** (used for the page title)
- At least **one dataset reference** is optional at scaffold time — add later with `/add-dataset`

If no project name is found:
```
ERROR: [new-portal] MISSING_INPUT No project name found in brief — provide a name and retry.
```

## Steps

### 1. Parse the brief from `$ARGUMENTS`

Extract:
- `PROJECT_NAME` — e.g. `"Auckland Council Open Data Portal"`
- `PROJECT_SLUG` — lowercase, hyphenated, no special chars (e.g. `auckland-council-open-data`)
- `DESCRIPTION` — one sentence describing the portal (default: `"An open data portal."`)
- `DATASETS` — list of file paths or URLs mentioned in the brief (can be empty)

If `$ARGUMENTS` is empty, ask:
```
To scaffold a portal I need:
1. Project name (e.g. "Auckland Open Data Portal")
2. Description (optional)
3. Any datasets to add? (file paths or URLs — you can also add them later with /add-dataset)
```

### 2. Find the template

```bash
TEMPLATE_DIR=$(git rev-parse --show-toplevel)/examples/portaljs-template
```

If the template directory does not exist:
```
ERROR: [new-portal] TEMPLATE_NOT_FOUND examples/portaljs-template not found — run this skill from inside the portaljs repo.
```

### 3. Copy the template

```bash
cp -r "$TEMPLATE_DIR" "./$PROJECT_SLUG"
# Remove build artifacts that must not be copied
rm -rf "./$PROJECT_SLUG/node_modules" "./$PROJECT_SLUG/.next"
```

If the destination already exists and is non-empty:
```
ERROR: [new-portal] DIR_EXISTS ./$PROJECT_SLUG already exists — choose a different name or remove the existing directory.
```

### 4. Substitute placeholder tokens

Replace all occurrences of the placeholder tokens in every file under `./$PROJECT_SLUG/`:

| Token | Replace with |
|-------|-------------|
| `__PROJECT_NAME__` | `PROJECT_NAME` |
| `__PROJECT_SLUG__` | `PROJECT_SLUG` |
| `__DESCRIPTION__` | `DESCRIPTION` |

```bash
find "./$PROJECT_SLUG" -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.json" -o -name "*.js" -o -name "*.css" -o -name "*.md" \) \
  | xargs sed -i '' \
      -e "s/__PROJECT_NAME__/$PROJECT_NAME/g" \
      -e "s/__PROJECT_SLUG__/$PROJECT_SLUG/g" \
      -e "s/__DESCRIPTION__/$DESCRIPTION/g"
```

Note: on Linux use `sed -i` (no argument after `-i`).

### 5. Install dependencies

```bash
cd "./$PROJECT_SLUG" && npm install
```

Tell the user first: `Installing dependencies (2–5 min on cold cache)...`

If `npm install` fails:
```
ERROR: [new-portal] INSTALL_FAILED npm install failed — check Node.js >=18 and network access, then retry.
```

### 6. Verify scaffold-ready

```bash
cd "./$PROJECT_SLUG" && npx next build 2>&1 | tail -10
```

If the build fails with an import or type error, read the error, fix it in the scaffolded project, then re-run the build before reporting success.

### 7. Report success

```
✓ Portal scaffolded at ./$PROJECT_SLUG
✓ Run: cd $PROJECT_SLUG && npm run dev  →  http://localhost:3000
```

If DATASETS were listed in the brief:
```
Datasets to add — run /add-dataset for each:
  - DATASET_1
  - DATASET_2
```

Otherwise:
```
Next: run /add-dataset to load your client's data into the portal.
```
