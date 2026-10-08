// Calls booked → PostHog (da-55j.2).
//
// The government path's success metric is calls booked, not sign-ups. Visitors book through a
// Google Calendar appointment schedule, reached via the site's /book-a-demo redirect. The
// redirect is tracked (book_a_demo_redirect) but the booking itself happens on
// calendar.google.com, which offers no webhook, so until now a booked call was invisible
// to PostHog.
//
// We don't need Google credentials to see bookings: Twenty's Google Calendar sync already
// copies every one into the CRM as a calendarEvent (titled "<schedule> (<booker>)", with
// Google's "Booked by" block in the description). That sync IS the "log each booking in
// Twenty" half of the bead. This module is the other half. A cron reads those events back
// from Twenty's REST API and sends:
//
//   call_booked     once per booking, timestamped when the booking was made
//   call_cancelled  once, if the booking is later cancelled
//
// Both are sent under the booker's email as distinct_id, so a booker who also signs up for
// Arc or Cloud can be merged in PostHog by email.
//
// Idempotency lives in D1 (booked_calls, migration 0007): a booking is recorded only
// after PostHog accepted its event, so a failed send is retried on the next run and a
// successful one is never re-sent.
//
// Like crm.ts, this NEVER throws out of the cron and is gated by an explicit switch:
// BOOKINGS_ENABLED="true" on production only. Staging shares the same Twenty workspace
// AND the same PostHog project, so a live staging cron would double-count every call.
// With the switch off, everything runs except the sends and D1 writes, which are logged
// instead.

import { captureServerEvent, type AnalyticsEnv } from './analytics'
import { isFreeEmailDomain, isValidEmail, normalizeEmail } from './email'

export interface BookingsEnv extends AnalyticsEnv {
  DB: D1Database
  TWENTY_API_TOKEN?: string
  // "true" ⇒ send events and record them. Anything else ⇒ dry run (log only).
  BOOKINGS_ENABLED?: string
  // Comma-separated appointment schedule names to count, matched against the calendar
  // event title "<schedule> (<booker>)". Defaults below. The schedule was renamed from
  // "PortalJS Cloud meetings" to "PortalJS meetings"; both names stay so history counts.
  BOOKING_SCHEDULES?: string
}

export const DEFAULT_SCHEDULES = ['PortalJS meetings', 'PortalJS Cloud meetings']

// Upcoming calls are always rescanned (a cancellation can arrive any time before the call).
// Past ones only for a short window, which absorbs Twenty sync lag and missed cron runs. The
// very first production run (empty table) looks back further, so the baseline (da-55j.3)
// lands in PostHog with each booking's original timestamp.
const LOOKBACK_DAYS = 14
const BACKFILL_DAYS = 120
const PAGE_LIMIT = 100

const CRM_BASE = 'https://crm.datopian.com/rest'

export interface CalendarEvent {
  id: string
  title?: string | null
  description?: string | null
  startsAt?: string | null
  externalCreatedAt?: string | null
  isCanceled?: boolean | null
}

export interface Booker {
  name?: string
  email: string
  organization?: string
  // Free-text answers to the booking form's other questions, keyed by question label.
  answers: Record<string, string>
}

export function configuredSchedules(env: Pick<BookingsEnv, 'BOOKING_SCHEDULES'>): string[] {
  const list = (env.BOOKING_SCHEDULES ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  return list.length ? list : DEFAULT_SCHEDULES
}

// "PortalJS meetings (Jane Doe)" → "PortalJS meetings", if that schedule is configured.
// Exact prefix match: Twenty's ilike filter is a coarse first pass, this is the real check.
export function scheduleOf(title: string | null | undefined, schedules: string[]): string | null {
  if (!title) return null
  for (const schedule of schedules) {
    if (title.toLowerCase().startsWith(`${schedule.toLowerCase()} (`) && title.endsWith(')')) return schedule
  }
  return null
}

const ORG_LABELS = /^(organi[sz]ation|organi[sz]ation name|company|company name|your company name)$/i

// Google's booking description, as stored by Twenty:
//
//   <b>Booked by</b>\nJane Doe\njane@city.gov\n<br><b>Organization</b>\nCity of X\n<br>
//   <b>Please, describe your project</b>\n…\n<br><schedule's own description, free HTML>
//
// Segments are separated by <br>. A form answer is "<b>label</b>\nvalue". Anything else
// (the schedule's marketing blurb) is ignored.
export function parseBooker(description: string | null | undefined): Booker | null {
  if (!description) return null
  let booker: Booker | null = null
  const answers: Record<string, string> = {}
  for (const segment of description.split(/<br\s*\/?>/i)) {
    const m = /^\s*<b>([^<]+)<\/b>\s*\n([\s\S]*)$/.exec(segment)
    if (!m) continue
    const label = m[1].trim()
    const body = m[2].trim()
    if (/^booked by$/i.test(label)) {
      const lines = body.split('\n').map((l) => l.trim()).filter(Boolean)
      const email = lines.find((l) => isValidEmail(l))
      if (!email) return null
      const name = lines.find((l) => l !== email)
      booker = { email: normalizeEmail(email), name, answers }
    } else if (body) {
      answers[label] = body
    }
  }
  if (!booker) return null
  const orgLabel = Object.keys(answers).find((l) => ORG_LABELS.test(l))
  if (orgLabel) booker.organization = answers[orgLabel]
  return booker
}

function hoursBetween(fromIso: string, toIso: string): number | null {
  const ms = Date.parse(toIso) - Date.parse(fromIso)
  return Number.isFinite(ms) ? Math.round(ms / 36e5) : null
}

// Event properties for PostHog. Free-text project descriptions stay in the CRM. We only
// send whether one was given, plus the answer to a "how did you hear about us" style
// question if the form has one: the only attribution a Google-hosted booking can carry.
export function bookingProperties(ev: CalendarEvent, schedule: string, booker: Booker): Record<string, unknown> {
  const heardLabel = Object.keys(booker.answers).find((l) => /hear about|find us|referr/i.test(l))
  const otherAnswers = Object.keys(booker.answers).filter((l) => !ORG_LABELS.test(l) && l !== heardLabel)
  return {
    schedule,
    booking_channel: 'google_appointment_schedule',
    calendar_event_id: ev.id,
    organization: booker.organization ?? null,
    email_domain: booker.email.split('@')[1],
    is_freemail: isFreeEmailDomain(booker.email),
    heard_from: heardLabel ? booker.answers[heardLabel] : null,
    has_project_description: otherAnswers.length > 0,
    starts_at: ev.startsAt ?? null,
    lead_time_hours: ev.externalCreatedAt && ev.startsAt ? hoursBetween(ev.externalCreatedAt, ev.startsAt) : null,
    $set: { email: booker.email, ...(booker.name ? { name: booker.name } : {}) },
    ...(booker.organization ? { $set_once: { organization: booker.organization } } : {}),
  }
}

// Twenty REST filter: any configured schedule, and either booked recently or still upcoming.
// The title pattern must not contain brackets. Twenty's filter parser counts "(" even
// inside quoted values and rejects the whole query ("close brackets are missing"), so the
// " (<booker>)" suffix is left to scheduleOf's exact check.
export function eventsFilter(schedules: string[], sinceIso: string, nowIso: string): string {
  const titles = schedules.map((s) => `title[ilike]:"${s.replace(/["()]/g, '')}%"`)
  const titleClause = titles.length === 1 ? titles[0] : `or(${titles.join(',')})`
  return `and(${titleClause},or(externalCreatedAt[gte]:"${sinceIso}",startsAt[gte]:"${nowIso}"))`
}

async function fetchEvents(token: string, filter: string): Promise<CalendarEvent[]> {
  const url = `${CRM_BASE}/calendarEvents?filter=${encodeURIComponent(filter)}&limit=${PAGE_LIMIT}`
  const res = await fetch(url, { headers: { authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error(`twenty calendarEvents ${res.status}: ${await res.text().catch(() => '')}`)
  const body = (await res.json()) as { data?: { calendarEvents?: CalendarEvent[] } }
  return body.data?.calendarEvents ?? []
}

interface BookedRow {
  calendar_event_id: string
  distinct_id: string
  cancelled_at: number | null
}

export interface SyncResult {
  scanned: number
  booked: number
  cancelled: number
  skipped: number
  dryRun: boolean
}

// One cron tick. Returns counts for logging/tests. Never throws.
export async function syncBookings(env: BookingsEnv, nowMs: number = Date.now()): Promise<SyncResult> {
  const dryRun = env.BOOKINGS_ENABLED !== 'true'
  const result: SyncResult = { scanned: 0, booked: 0, cancelled: 0, skipped: 0, dryRun }
  const token = env.TWENTY_API_TOKEN
  if (!token) {
    console.error('bookings sync skipped: TWENTY_API_TOKEN not set')
    return result
  }
  try {
    const schedules = configuredSchedules(env)
    const known = await env.DB.prepare('SELECT COUNT(*) AS n FROM booked_calls').first<{ n: number }>()
    const days = (known?.n ?? 0) === 0 ? BACKFILL_DAYS : LOOKBACK_DAYS
    const nowIso = new Date(nowMs).toISOString()
    const sinceIso = new Date(nowMs - days * 864e5).toISOString()
    const events = await fetchEvents(token, eventsFilter(schedules, sinceIso, nowIso))
    result.scanned = events.length
    const nowSec = Math.floor(nowMs / 1000)

    for (const ev of events) {
      const schedule = scheduleOf(ev.title, schedules)
      const booker = schedule ? parseBooker(ev.description) : null
      if (!schedule || !booker) {
        result.skipped++
        continue
      }
      const bookedAt = ev.externalCreatedAt ?? nowIso
      const row = await env.DB.prepare(
        'SELECT calendar_event_id, distinct_id, cancelled_at FROM booked_calls WHERE calendar_event_id = ?'
      )
        .bind(ev.id)
        .first<BookedRow>()

      if (!row) {
        const properties = bookingProperties(ev, schedule, booker)
        if (dryRun) {
          console.log('bookings dry run: would capture call_booked', JSON.stringify({ id: ev.id, schedule }))
        } else {
          const ok = await captureServerEvent(env, {
            event: 'call_booked',
            distinctId: booker.email,
            properties,
            timestamp: bookedAt,
          })
          if (!ok) {
            console.error('bookings: call_booked capture failed; will retry', ev.id)
            continue
          }
          await env.DB.prepare(
            'INSERT INTO booked_calls (calendar_event_id, schedule, distinct_id, booked_at, starts_at, captured_at) VALUES (?, ?, ?, ?, ?, ?)'
          )
            .bind(ev.id, schedule, booker.email, bookedAt, ev.startsAt ?? null, nowSec)
            .run()
        }
        result.booked++
      }

      if (ev.isCanceled && !row?.cancelled_at) {
        if (dryRun) {
          console.log('bookings dry run: would capture call_cancelled', JSON.stringify({ id: ev.id, schedule }))
        } else {
          const ok = await captureServerEvent(env, {
            event: 'call_cancelled',
            distinctId: row?.distinct_id ?? booker.email,
            properties: { schedule, calendar_event_id: ev.id, starts_at: ev.startsAt ?? null },
            timestamp: nowIso,
          })
          if (!ok) {
            console.error('bookings: call_cancelled capture failed; will retry', ev.id)
            continue
          }
          await env.DB.prepare('UPDATE booked_calls SET cancelled_at = ? WHERE calendar_event_id = ?')
            .bind(nowSec, ev.id)
            .run()
        }
        result.cancelled++
      }
    }
  } catch (err) {
    console.error('bookings sync failed', err instanceof Error ? err.message : String(err))
  }
  console.log('bookings sync', JSON.stringify(result))
  return result
}
