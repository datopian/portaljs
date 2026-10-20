#!/usr/bin/env node
// Guard against the shipped-skills lists drifting apart (issue #1671).
//
// The `commands` array of .claude-plugin/plugin.json is the single source of truth
// for which skills ship. create-portaljs and scripts/install-portaljs-skills.sh
// read it at runtime; this check asserts everything else agrees with it:
//
//   - every plugin.json command file exists, and `skills` lists the same names,
//     each with a skills/<name>/SKILL.md
//   - every .claude/commands/*.md is either a listed skill or a "Renamed →" alias
//     stub, and every skills/<dir> is listed
//   - the alias stubs match the installer's ALIASES list
//   - scripts/skills-manifest.mjs (README/site tables) has the same skills
//   - create-portaljs's offline FALLBACK_SKILLS has the same skills
//   - the repo-root CLAUDE.md mentions every skill
//
// Usage: node scripts/check-skills-sync.mjs   (npm run skills:check)

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { SKILLS as MANIFEST } from './skills-manifest.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => readFileSync(join(ROOT, p), 'utf8')
const errors = []

function sameSet(label, actual, expected) {
  const missing = expected.filter((n) => !actual.includes(n))
  const extra = actual.filter((n) => !expected.includes(n))
  if (missing.length) errors.push(`${label} is missing: ${missing.join(', ')}`)
  if (extra.length) errors.push(`${label} has extra entries not in plugin.json: ${extra.join(', ')}`)
  const dupes = actual.filter((n, i) => actual.indexOf(n) !== i)
  if (dupes.length) errors.push(`${label} has duplicates: ${dupes.join(', ')}`)
}

// 1. plugin.json — the source of truth.
const plugin = JSON.parse(read('.claude-plugin/plugin.json'))
const names = []
for (const entry of plugin.commands ?? []) {
  const m = /^\.\/\.claude\/commands\/([a-z0-9-]+)\.md$/.exec(entry)
  if (!m) errors.push(`plugin.json commands: unexpected entry ${entry}`)
  else if (!existsSync(join(ROOT, entry))) errors.push(`plugin.json commands: ${entry} does not exist`)
  else names.push(m[1])
}
if (!names.length) errors.push('plugin.json commands is empty')

const skillDirs = []
for (const entry of plugin.skills ?? []) {
  const m = /^\.\/skills\/([a-z0-9-]+)$/.exec(entry)
  if (!m) errors.push(`plugin.json skills: unexpected entry ${entry}`)
  else if (!existsSync(join(ROOT, entry, 'SKILL.md'))) errors.push(`plugin.json skills: ${entry}/SKILL.md does not exist`)
  else skillDirs.push(m[1])
}
sameSet('plugin.json skills', skillDirs, names)

// 2. Everything on disk is accounted for.
const isAlias = (file) => /^description:\s*"?Renamed →/m.test(read(join('.claude/commands', file)))
const aliasesOnDisk = []
for (const file of readdirSync(join(ROOT, '.claude/commands'))) {
  if (!file.endsWith('.md')) continue
  const name = file.slice(0, -3)
  if (names.includes(name)) continue
  if (isAlias(file)) aliasesOnDisk.push(name)
  else errors.push(`.claude/commands/${file} is neither listed in plugin.json commands nor a "Renamed →" alias stub`)
}
for (const dir of readdirSync(join(ROOT, 'skills'))) {
  if (!statSync(join(ROOT, 'skills', dir)).isDirectory()) continue
  if (!skillDirs.includes(dir)) errors.push(`skills/${dir} is not listed in plugin.json skills`)
}

// 3. The installer's alias stubs.
const aliasesLine = /^ALIASES="([^"]*)"/m.exec(read('scripts/install-portaljs-skills.sh'))
if (!aliasesLine) errors.push('scripts/install-portaljs-skills.sh: no ALIASES="…" line')
else {
  const aliases = aliasesLine[1].split(/\s+/).filter(Boolean)
  for (const a of aliases) {
    if (!aliasesOnDisk.includes(a)) errors.push(`installer ALIASES: .claude/commands/${a}.md is not an alias stub on disk`)
  }
  for (const a of aliasesOnDisk) {
    if (!aliases.includes(a)) errors.push(`alias stub .claude/commands/${a}.md is not in the installer's ALIASES`)
  }
}

// 4. The docs manifest (README / site tables are generated from it).
sameSet('scripts/skills-manifest.mjs', MANIFEST.map((s) => s.id), names)

// 5. create-portaljs's offline fallback list.
const fallback = /const FALLBACK_SKILLS = \[([\s\S]*?)\]/.exec(read('packages/create-portaljs/index.mjs'))
if (!fallback) errors.push('packages/create-portaljs/index.mjs: no FALLBACK_SKILLS array')
else sameSet('create-portaljs FALLBACK_SKILLS', [...fallback[1].matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1]), names)

// 6. The repo-root CLAUDE.md skills list ("- `/<name>` — …" bullets), both ways: every
// shipped skill is listed, and no listed skill has stopped shipping.
const claudeMd = read('CLAUDE.md')
const undocumented = names.filter((n) => !claudeMd.includes(`/${n}\``))
if (undocumented.length) errors.push(`CLAUDE.md does not mention: ${undocumented.map((n) => '/' + n).join(', ')}`)
const skillsSection = /^## Skills\b[\s\S]*?(?=^## |(?![\s\S]))/m.exec(claudeMd)?.[0] ?? ''
if (!skillsSection) errors.push('CLAUDE.md: no "## Skills" section')
const listed = [...skillsSection.matchAll(/^- `\/([a-z0-9-]+)`/gm)].map((m) => m[1])
const stale = listed.filter((n) => !names.includes(n))
if (stale.length) errors.push(`CLAUDE.md lists skills not in plugin.json: ${stale.map((n) => '/' + n).join(', ')}`)

if (errors.length) {
  console.error('Shipped-skill lists are out of sync with .claude-plugin/plugin.json:\n  ' + errors.join('\n  '))
  process.exit(1)
}
console.log(`Shipped-skill lists are in sync with plugin.json (${names.length} skills) ✓`)
