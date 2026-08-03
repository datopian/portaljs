# Analytics bot filtering — referrer-spoofed traffic (po-ywf)

How PortalJS LP analytics excludes headless-browser traffic that forges a Google referrer, why
the signal is what it is, and what July 2026 actually looked like once it was removed.

PostHog project: **PortalJS LP** (id `123619`, EU cloud).

## The problem

July 2026 reported **5,343 sessions** with a `www.google.com` referrer. Google Search Console
recorded **193 clicks** for the same month — a 27x gap. PostHog's bot classifier labelled every
one of these sessions `Regular`: the traffic ran a real browser engine, executed JS, and
reported Core Web Vitals, so nothing in the user agent gave it away.

The concentration was the tell. `/blog/why-we-decoupled-CKAN-frontend` took **2,010** of those
pageviews against **1** from any other client, and `/git` took 462 against 4.

## The fingerprints

Two shapes, both Linux desktop Chrome 149, both with referrer exactly `https://www.google.com/`:

| | screen | viewport | July sessions | pageviews/session |
|---|---|---|---|---|
| **A** | 1920x1080 | **1919**x992 | 4,848 | 1.00 |
| **B** | **800x600** | 1920x993 | 161 | 1.00 |

What makes these safe to exclude:

- **A** — 4,848 sessions across 60+ cities shared one byte-identical
  `(screen, viewport, user agent, language)` tuple. Real traffic never does that. A viewport
  width of 1919 appears **nowhere else** in the project's 2026 data except 6 pageviews in April.
- **B** — the viewport (1920x993) is *larger than the screen* (800x600). Physically impossible
  in a real browser. 800x600 is the default virtual screen of a headless browser started
  without an explicit window size.

Corroborating evidence, none of which is used as the filter itself:

- Hourly volume was flat across all 24 hours — no diurnal curve. Real traffic peaks in the
  workday.
- 3 of 5,013 sessions (0.06%) emitted `$pageleave`; the clean residual runs 51.5%.
- Geography clustered on datacenter metros — Ashburn, Dallas, Singapore, Warsaw.
- Campaign window: first significant day **2026-06-30**, last **2026-07-23**, fully stopped by
  2026-07-26. It is not currently active.

`$virt_is_bot` / `$virt_traffic_type` are useless here — PostHog scored the whole cohort
`Regular`, `is_bot=False`. IP-level analysis is unavailable: the project has
`anonymize_ips: true`.

## The exclusion (authoritative control)

Query-time, in the project's **internal and test users** filters
(`test_account_filters`), with `test_account_filters_default_checked: true` so new insights
inherit it:

```json
[
  { "key": "$host",           "type": "event", "value": "^(localhost|127\\.0\\.0\\.1)($|:)", "operator": "not_regex" },
  { "key": "$viewport_width", "type": "event", "value": ["1919"], "operator": "is_not" },
  { "key": "$screen_width",   "type": "event", "value": ["800"],  "operator": "is_not" }
]
```

The first entry is pre-existing (localhost exclusion); the last two are the bot filter. Being
query-time, it is **retroactive** — it corrects historical months, not just new data — and it can
be retargeted if a fingerprint shifts. To revert, PATCH `test_account_filters` back to the
single `$host` entry.

Verified behaviour:

- Applies correctly across Web Analytics **and** insights. Fresh window 2026-07-14..21:
  4,199 → 405 sessions, bounce rate 92.6% → 43.0%, session duration 17.8s → 151.2s.
- Does **not** drop events that lack the properties. `arc_signup_completed` is captured
  server-side with no `$viewport_width` / `$screen_width`; it survives the filter. Every
  conversion event was checked against this.

`$screen_width is_not 800` also removes ~83 pageviews over seven months from real 800x1280 /
800x1334 tablets — 0.2% of traffic, accepted as the cost of catching fingerprint B with a
filter expressible as a flat property condition.

### Two mechanisms that do not work

- **A `hogql`-type test-account filter** (which could express the exact
  `NOT (vw=1919 OR (sw=800 AND sh=600))` conjunction, sparing the tablets) **zeroes out the
  Web Analytics scene entirely.** Its session-scoped query path cannot resolve event
  properties from a raw HogQL predicate. Do not use it here.
- **Session-level properties** cannot express this signal at all — the sessions table carries
  no browser, screen, or viewport property.

> **Caching gotcha when verifying.** PostHog caches query results by query hash. After changing
> `test_account_filters`, re-running an identical date range returns the pre-change cached
> numbers, which reads exactly like "the filter does nothing" (or, if a broken filter was tried
> first, like "the filter zeroes everything"). Verify on a date range you have not queried
> before, or vary a harmless field such as `doPathCleaning`.

## Client-side layer

`site/lib/analyticsBotFilter.ts`, wired into `posthog.init` in `site/pages/_app.tsx` as
`before_send`. Blocks `navigator.webdriver === true`, `/Headless/i` user agents, and the
800x600 default screen, so naive automation never reaches ingestion.

This is a **secondary** layer and deliberately narrow. Fingerprint A would have slipped past
every check in it: `navigator.webdriver` is patchable by stealth plugins and the user agent was
a plain `Chrome/149.0.0.0`. A false positive is silent, permanent data loss, so the module
under-blocks on purpose — notably it has no general "viewport bigger than screen" rule, because
mobile browsers legitimately report `innerWidth` above `screen.width` on pages with a fixed
viewport.

## July 2026, recomputed

Web Analytics, `filterTestAccounts` on vs off:

| Metric | Reported | Corrected | Change |
|---|---|---|---|
| Visitors | 6,430 | **1,280** | −80% |
| Pageviews | 8,414 | **3,175** | −62% |
| Sessions | 6,706 | **1,547** | −77% |
| Session duration | 48.2s | **167.6s** | 3.5x |
| Bounce rate | 86.0% | **48.2%** | −37.8pp |

Conversion counts themselves never moved — the bot submitted no forms. Only the denominator was
inflated, which understated every rate by ~4.3x. July `build_signup_submitted`: 8 events, so
0.12% of reported sessions but **0.51%** of real ones.

## Reconciliation against Search Console

Google entry sessions on `www.portaljs.com` (session-entry referrer, matching how Search
Console counts clicks):

| | sessions |
|---|---|
| Reported (all google-referred) | 5,343 |
| After bot exclusion | 326 |
| …of which paid (`gclid` / `gad_source` / `gbraid`) | 73 |
| **Clean organic** | **253** |
| Search Console clicks | 193 |
| **Ratio** | **1.31x** |

The 27x gap is fully accounted for: **1.31x** is the ordinary PostHog-vs-Search-Console delta.
Search Console's default report counts Web search type only, excluding Images, News and
Discover clicks that still carry a `www.google.com` referrer; and Google Ads clicks never appear
in Search Console at all, which is 73 of the 326.

The independent check is that the corrected series has no anomaly left in it. Clean google entry
sessions by month (organic / paid):

| Month | Organic | Paid |
|---|---|---|
| 2026-02 | 187 | 4 |
| 2026-03 | 310 | 15 |
| 2026-04 | 244 | 78 |
| 2026-05 | 208 | 65 |
| 2026-06 | 162 | 69 |
| **2026-07** | **253** | **73** |

July lands mid-band against every pre-campaign month. The filter removed the excess and left
the baseline untouched — which is what calibration means here, and why the reported 27x was
entirely artifact.

## Residual traffic is clean

The 334 surviving google-referred July sessions behave like people: Windows/Android/Mac
dominant, 1.35–2.31 pageviews per session, 51.5% emitting `$pageleave`, spread over 50+ cities.

One unrelated cohort is worth naming but was **not** filtered: a Chrome 150 / Linux crawler,
~41 sessions in July, walking `/opensource/*` docs pages sequentially with varied viewport
heights and countries. It is a documentation scraper, a different shape from this campaign, and
too small to distort headline numbers. If it grows, it needs its own signal — not this one.

## If it comes back

1. Break down `$pageview` by `($browser, $browser_version, $os, $screen_width, $screen_height,
   $viewport_width)` for the affected referrer. A cohort sharing one exact tuple across many
   cities is the campaign.
2. Confirm with hourly distribution (flat = automated) and `$pageleave` rate (near zero).
3. Confirm the geometry is impossible or unique before filtering — never filter on user agent or
   browser version alone. Real Chrome 149 Linux traffic exists in this project, including a real
   `$direct` visitor sharing the bot's exact user agent string. Filtering on the user agent would
   have taken them with it.
4. Add the discriminating property as a flat `is_not` entry in `test_account_filters`, then
   verify on a never-queried date range.
