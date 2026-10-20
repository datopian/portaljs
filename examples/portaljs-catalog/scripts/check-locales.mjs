#!/usr/bin/env node
// Validate the UI locale files (npm run i18n:check). locales/en.json is the
// source of truth; for every locales/<code>.json this checks that:
//
//   - it has exactly en.json's keys. Plural keys (those with a `.other` form in
//     en.json) may carry any CLDR category (zero/one/two/few/many/other); `.other`
//     is required, and so is `.one` when the language uses it. Other categories the
//     language uses but the file lacks are only warned about (they fall back to the
//     file's own `.other`).
//   - every value keeps en.json's {placeholders}: the same set for plain keys; for
//     plural forms no unknown ones, and only {count} may be dropped (e.g. "one file").
//   - `_intl` is a valid BCP 47 tag (it drives number/date/plural formatting).
//   - it is registered in LOCALES in lib/i18n.ts (one import + one entry).
//
// It also checks DEFAULT_LOCALE in next.config.js names a registered locale.
// Exits non-zero with the list of problems.

import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const LOCALES_DIR = join(ROOT, 'locales')
const CATEGORIES = ['zero', 'one', 'two', 'few', 'many', 'other']

const errors = []
const warnings = []

function readJson(file) {
  try {
    return JSON.parse(readFileSync(join(LOCALES_DIR, file), 'utf8'))
  } catch (e) {
    errors.push(`${file}: not valid JSON (${e.message})`)
    return null
  }
}

const placeholders = (s) => new Set([...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]))
const list = (xs) => [...xs].map((x) => `{${x}}`).join(', ')

const en = readJson('en.json')
if (!en) {
  console.error('✖ locales/en.json is missing or invalid.\n  ' + errors.join('\n  '))
  process.exit(1)
}

// Split en.json into plural bases (key.one / key.other …) and plain keys.
const pluralBases = new Set(
  Object.keys(en)
    .filter((k) => k.endsWith('.other'))
    .map((k) => k.slice(0, -'.other'.length))
)
const baseOf = (k) => {
  const i = k.lastIndexOf('.')
  return i > 0 && CATEGORIES.includes(k.slice(i + 1)) && pluralBases.has(k.slice(0, i))
    ? k.slice(0, i)
    : null
}
const plainKeys = Object.keys(en).filter((k) => !k.startsWith('_') && !baseOf(k))

// Registered locales in lib/i18n.ts: `import it from '../locales/it.json'` and the
// `const LOCALES: Record<string, Messages> = { en, it, 'pt-BR': ptBR }` line.
const i18nSrc = readFileSync(join(ROOT, 'lib/i18n.ts'), 'utf8')
const importFor = new Map() // identifier -> file code
for (const m of i18nSrc.matchAll(/^import\s+(\w+)\s+from\s+['"]\.\.\/locales\/([\w-]+)\.json['"]/gm)) {
  importFor.set(m[1], m[2])
}
const registered = new Map() // locale code -> file code it points at
const localesLine = /const LOCALES[^=]*=\s*\{([^}]*)\}/.exec(i18nSrc)
if (!localesLine) errors.push('lib/i18n.ts: cannot find the `const LOCALES … = { … }` line')
else {
  for (const raw of localesLine[1].split(',').map((x) => x.trim()).filter(Boolean)) {
    const m = /^(?:['"]?([\w-]+)['"]?\s*:\s*)?(\w+)$/.exec(raw)
    if (!m) {
      errors.push(`lib/i18n.ts: cannot parse LOCALES entry "${raw}"`)
      continue
    }
    const code = m[1] ?? m[2]
    const file = importFor.get(m[2])
    if (!file) errors.push(`lib/i18n.ts: LOCALES entry "${raw}" has no matching import from ../locales/`)
    else registered.set(code, file)
  }
}

function checkLocale(file, msgs) {
  const code = file.replace(/\.json$/, '')
  const where = `locales/${file}`

  // _intl
  let pluralCats = ['one', 'other']
  if (typeof msgs._intl !== 'string' || !msgs._intl) {
    errors.push(`${where}: "_intl" is not set (a BCP 47 tag such as "it-IT")`)
  } else {
    try {
      Intl.getCanonicalLocales(msgs._intl)
      pluralCats = new Intl.PluralRules(msgs._intl).resolvedOptions().pluralCategories
    } catch {
      errors.push(`${where}: "_intl" is not a valid BCP 47 tag: "${msgs._intl}"`)
    }
  }

  // Registration
  if (registered.get(code) !== file.replace(/\.json$/, '')) {
    errors.push(
      `${where}: not registered in lib/i18n.ts — add \`import … from '../locales/${file}'\` and a "${code}" entry in LOCALES`
    )
  }

  if (code === 'en') return // en.json is the reference for everything below

  // Plain keys: present, same placeholders.
  for (const k of plainKeys) {
    if (msgs[k] === undefined) {
      errors.push(`${where}: missing key "${k}"`)
      continue
    }
    if (typeof msgs[k] !== 'string') {
      errors.push(`${where}: "${k}" is not a string`)
      continue
    }
    const want = placeholders(en[k])
    const got = placeholders(msgs[k])
    const missing = [...want].filter((p) => !got.has(p))
    const extra = [...got].filter((p) => !want.has(p))
    if (missing.length) errors.push(`${where}: "${k}" drops placeholder(s) ${list(missing)}`)
    if (extra.length) errors.push(`${where}: "${k}" has unknown placeholder(s) ${list(extra)}`)
  }

  // Plural keys: .other (and .one when the language uses it) required. Other
  // categories the language uses (e.g. .few in Polish) are collected as warnings.
  const absent = new Map() // category -> plural bases without it
  for (const base of pluralBases) {
    const want = new Set()
    for (const c of CATEGORIES) if (en[`${base}.${c}`] !== undefined) placeholders(en[`${base}.${c}`]).forEach((p) => want.add(p))
    const have = CATEGORIES.filter((c) => msgs[`${base}.${c}`] !== undefined)
    if (!have.length) {
      errors.push(`${where}: missing key "${base}.other" (plural: ${pluralCats.map((c) => `.${c}`).join(' ')})`)
      continue
    }
    if (!have.includes('other')) errors.push(`${where}: missing key "${base}.other"`)
    if (pluralCats.includes('one') && !have.includes('one')) errors.push(`${where}: missing key "${base}.one"`)
    for (const c of pluralCats) {
      if (c === 'one' || c === 'other' || have.includes(c)) continue
      if (!absent.has(c)) absent.set(c, [])
      absent.get(c).push(base)
    }
    for (const c of have) {
      const k = `${base}.${c}`
      const got = placeholders(msgs[k])
      const extra = [...got].filter((p) => !want.has(p))
      const missing = [...want].filter((p) => p !== 'count' && !got.has(p))
      if (extra.length) errors.push(`${where}: "${k}" has unknown placeholder(s) ${list(extra)}`)
      if (missing.length) errors.push(`${where}: "${k}" drops placeholder(s) ${list(missing)}`)
    }
  }

  for (const [c, bases] of absent) {
    warnings.push(
      `${where}: ${bases.length} plural key(s) have no .${c} form, which ${msgs._intl} uses ` +
        `(falls back to .other): ${bases.slice(0, 3).join(', ')}${bases.length > 3 ? ', …' : ''}`
    )
  }

  // Keys en.json doesn't have.
  for (const k of Object.keys(msgs)) {
    if (k.startsWith('_')) continue
    if (en[k] !== undefined && !baseOf(k)) continue
    if (baseOf(k)) continue // any CLDR category of a plural key is fine
    errors.push(`${where}: unknown key "${k}" (not in en.json)`)
  }
}

const files = readdirSync(LOCALES_DIR).filter((f) => f.endsWith('.json')).sort()
for (const file of files) {
  const msgs = file === 'en.json' ? en : readJson(file)
  if (msgs) checkLocale(file, msgs)
}
for (const [code, file] of registered) {
  if (!files.includes(`${file}.json`)) errors.push(`lib/i18n.ts: LOCALES registers "${code}" but locales/${file}.json does not exist`)
}

// DEFAULT_LOCALE in next.config.js
const nextConfig = readFileSync(join(ROOT, 'next.config.js'), 'utf8')
const def = /const DEFAULT_LOCALE\s*=\s*['"]([\w-]+)['"]/.exec(nextConfig)?.[1]
if (!def) errors.push("next.config.js: no `const DEFAULT_LOCALE = '<code>'` line")
else if (!registered.has(def)) errors.push(`next.config.js: DEFAULT_LOCALE "${def}" is not a registered locale in lib/i18n.ts`)

for (const w of warnings) console.warn(`⚠ ${w}`)
if (errors.length) {
  console.error(`✖ Locale check failed (${errors.length} problem${errors.length === 1 ? '' : 's'}):\n  ` + errors.join('\n  '))
  process.exit(1)
}
console.log(
  `✓ Locales OK: ${files.map((f) => f.replace(/\.json$/, '')).join(', ')} — ${Object.keys(en).filter((k) => !k.startsWith('_')).length} keys; DEFAULT_LOCALE = ${def}`
)
