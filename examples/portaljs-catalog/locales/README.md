# Locales

One JSON file per language, all with the same keys. `en.json` is the source of truth
and the fallback: a key missing from another file renders in English.

- Keys are dotted ids grouped by area (`search.placeholder`, `dataset.lastUpdated`…).
- `{name}` placeholders are filled in by the code. Keep them verbatim (you can move
  them within the sentence); `{manifest}`-style ones stand for inline markup such as
  `<code>datasets.json</code>`.
- Plurals use `.one` / `.other` suffixes. Add `.zero`, `.two`, `.few` or `.many` for
  languages whose `Intl.PluralRules` use them (e.g. `.few` and `.many` in Polish); a
  missing category falls back to the file's own `.other`.
- `_intl` is the BCP 47 tag used to format numbers and dates (`"en-US"`, `"it-IT"`…).

## Set the portal's language

The language is a committed setting: `DEFAULT_LOCALE` in `next.config.js`.

1. Copy `en.json` to `<code>.json` (e.g. `it.json`), translate the values and set `_intl`.
2. Register it in `lib/i18n.ts`:
   ```ts
   import it from '../locales/it.json'
   const LOCALES: Record<string, Messages> = { en, it }   // hyphenated: 'pt-BR': ptBR
   ```
3. Set `const DEFAULT_LOCALE = 'it'` in `next.config.js`. Every build and deploy now
   ships the Italian UI, with `<html lang="it">`.
4. Run `npm run i18n:check`. It fails if a file is missing a key, drops or invents a
   `{placeholder}`, lacks `_intl`, isn't registered, or `DEFAULT_LOCALE` names an
   unregistered locale.

`NEXT_PUBLIC_LOCALE=<code> npm run build` overrides `DEFAULT_LOCALE` for one build (for
example to preview another language). It is one language per build because the portal is
a static export; an unregistered locale fails the build.

When you add a key to `en.json`, add it to every other file here too, then run
`npm run i18n:check`.
