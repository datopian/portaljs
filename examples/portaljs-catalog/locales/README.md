# Locales

One JSON file per language, all with the same keys. `en.json` is the source of truth
and the fallback: a key missing from another file renders in English.

- Keys are dotted ids grouped by area (`search.placeholder`, `dataset.lastUpdated`…).
- `{name}` placeholders are filled in by the code. Keep them as they are; you can move
  them within the sentence.
- Plurals use `.one` / `.other` suffixes (plus `.zero`, `.two`, `.few`, `.many` where the
  language has them, per `Intl.PluralRules`).
- `_intl` is the BCP 47 tag used to format numbers and dates (`"en-US"`, `"it-IT"`…).

## Add a language

1. Copy `en.json` to `<code>.json` (e.g. `it.json`) and translate the values.
2. Register it in `lib/i18n.ts`:
   ```ts
   import it from '../locales/it.json'
   const LOCALES: Record<string, Messages> = { en, it }
   ```
3. Build with it: `NEXT_PUBLIC_LOCALE=it npm run build`. `<html lang>` becomes `it`.

The language is fixed at build time, one per build, because the portal is a static
export. An unregistered `NEXT_PUBLIC_LOCALE` fails the build.
