// UI strings, plurals, and number/date formatting — a tiny i18n layer built on
// Intl, with no i18n library. Every user-facing string in the template lives in
// locales/<code>.json, keyed by a dotted id grouped by area (nav.*, search.*,
// dataset.*, query.*…); pages and components call t('key') instead of
// hardcoding English.
//
// ONE LOCALE PER BUILD. The template builds to a static export, which Next.js's
// built-in i18n routing does not support, so the language is fixed at build time.
// The portal's language is DEFAULT_LOCALE in next.config.js (committed, so every
// build and deploy uses it); NEXT_PUBLIC_LOCALE=<code> overrides it for one build.
//
// Locale files are imported statically (bundled), never fetched. To add a
// language: copy locales/en.json to locales/<code>.json, translate the values
// (keep the keys and {placeholders}), register it in LOCALES below, set
// DEFAULT_LOCALE, and run `npm run i18n:check`. See locales/README.md.

import { Fragment, createElement, type ReactNode } from 'react'
import en from '../locales/en.json'
import it from '../locales/it.json'

type Messages = Record<string, string>
type Vars = Record<string, string | number>

// Registered locales. Add one import + one entry per language (quote a code with
// a hyphen: { en, 'pt-BR': ptBR }). scripts/check-locales.mjs reads this line.
const LOCALES: Record<string, Messages> = { en, it }

// The active locale code — also the <html lang> value (pages/_document.tsx).
// next.config.js always sets it (DEFAULT_LOCALE, or the NEXT_PUBLIC_LOCALE
// override); 'en' only applies to plain node scripts such as generate:dcat.
export const LOCALE = process.env.NEXT_PUBLIC_LOCALE || 'en'

if (!LOCALES[LOCALE]) {
  // Fail the build loudly rather than silently ship English for a typo'd locale.
  throw new Error(
    `Unknown locale "${LOCALE}" (DEFAULT_LOCALE / NEXT_PUBLIC_LOCALE): add locales/${LOCALE}.json and register it in lib/i18n.ts`
  )
}

const messages: Messages = LOCALES[LOCALE]
const fallback: Messages = en

// BCP 47 tag for Intl number/date/plural formatting. A locale file sets it as
// `_intl` (e.g. "it-IT"); without one, the locale code itself is used.
export const INTL_LOCALE = messages._intl || LOCALE

const warned = new Set<string>()

function warnMissing(key: string, usedEnglish: boolean) {
  if (process.env.NODE_ENV === 'production' || warned.has(key)) return
  warned.add(key)
  console.warn(
    `[i18n] missing key "${key}" in locale "${LOCALE}"` +
      (usedEnglish ? ' (using English)' : '')
  )
}

// Look up a key: the active locale, then English, then the key itself (so a
// missing string is visible, never blank). Warns once per key outside production.
function lookup(key: string): string {
  const own = messages[key]
  if (own !== undefined) return own
  const english = fallback[key]
  warnMissing(key, english !== undefined)
  return english ?? key
}

function interpolate(s: string, vars?: Vars): string {
  if (!vars) return s
  return s.replace(/\{(\w+)\}/g, (m, name: string) =>
    vars[name] !== undefined ? String(vars[name]) : m
  )
}

// Translate a key, replacing {name} placeholders from `vars`.
//   t('search.pageTitle', { name: 'My Portal' }) → "Search — My Portal"
export function t(key: string, vars?: Vars): string {
  return interpolate(lookup(key), vars)
}

const pluralRules = new Intl.PluralRules(INTL_LOCALE)

// The plural form of `key` for `count`: `<key>.<category>` by Intl.PluralRules
// (one, other — and few/many/… for languages that have them). A category the
// locale doesn't define uses the locale's own `<key>.other`; English is used only
// when the locale lacks the key entirely.
export function pluralKey(key: string, count: number): string {
  const k = `${key}.${pluralRules.select(count)}`
  if (messages[k] !== undefined) return k
  if (messages[`${key}.other`] !== undefined) return `${key}.other`
  return fallback[k] !== undefined ? k : `${key}.other`
}

// Singular/plural translation. {count} is the raw count unless `vars.count` is
// given (e.g. a formatNumber(n) string).
//   tn('dataset.fileCount', 1) → "1 file";  tn('dataset.fileCount', 3) → "3 files"
export function tn(key: string, count: number, vars?: Vars): string {
  return interpolate(lookup(pluralKey(key, count)), { count, ...vars })
}

// Like t(), but a placeholder may be a React node — for strings with inline markup:
//   tx('search.emptyCatalog', { manifest: <code>datasets.json</code> })
// For a plural string with markup, pass tx(pluralKey(key, n), vars).
export function tx(key: string, vars: Record<string, ReactNode>): ReactNode {
  const parts = lookup(key).split(/\{(\w+)\}/)
  // split() with a capture group alternates text, placeholder name, text, …
  return parts.map((part, i) =>
    createElement(Fragment, { key: i }, i % 2 === 1 ? (vars[part] ?? `{${part}}`) : part)
  )
}

// Locale-aware number formatting (grouping, decimal separator).
export function formatNumber(n: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(INTL_LOCALE, options).format(n)
}

// Render an ISO 8601 timestamp as a short human date ("Aug 25, 2021" in en).
// Returns the input unchanged when it isn't parseable, so a non-ISO string still
// displays.
export function formatDate(iso: string): string {
  const ts = Date.parse(iso)
  if (Number.isNaN(ts)) return iso
  return new Date(ts).toLocaleDateString(INTL_LOCALE, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
