import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  parseBooker,
  scheduleOf,
  configuredSchedules,
  bookingProperties,
  eventsFilter,
  syncBookings,
  DEFAULT_SCHEDULES,
  type CalendarEvent,
} from '../src/bookings'

// Calls-booked sync (da-55j.2). Twenty's Google Calendar sync stores each appointment
// booking as a calendarEvent; syncBookings turns new ones into call_booked / call_cancelled
// PostHog events exactly once, using D1 as memory.

// The description shape Google writes and Twenty stores (fixture names, not real people).
const DESC =
  '<b>Booked by</b>\nJane Doe\nJane.Doe@City.gov.example\n<br><b>Organization</b>\nCity of Example \n' +
  '<br><b>Please, describe your project</b>\nWe run a Socrata portal and want to move.\n' +
  '<br><b>How did you hear about us?</b>\nEmail from PortalJS\n' +
  '<br>PortalJS helps governments publish open data. Book a call.'

function event(overrides: Partial<CalendarEvent> = {}): CalendarEvent {
  return {
    id: 'ev-1',
    title: 'PortalJS meetings (Jane Doe)',
    description: DESC,
    externalCreatedAt: '2026-10-01T09:00:00.000Z',
    startsAt: '2026-10-03T09:00:00.000Z',
    isCanceled: false,
    ...overrides,
  }
}

describe('parseBooker', () => {
  it('reads name, normalised email, organization and other answers', () => {
    const b = parseBooker(DESC)!
    expect(b.name).toBe('Jane Doe')
    expect(b.email).toBe('jane.doe@city.gov.example')
    expect(b.organization).toBe('City of Example')
    expect(b.answers['Please, describe your project']).toMatch(/Socrata/)
  })

  it('accepts the other organization labels the schedules have used', () => {
    const d = '<b>Booked by</b>\nA B\na@b.org\n<br><b>Your company name</b>\nAcme\n<br>blurb'
    expect(parseBooker(d)!.organization).toBe('Acme')
  })

  it('returns null without a Booked by block or without an email in it', () => {
    expect(parseBooker('Team sync agenda')).toBeNull()
    expect(parseBooker('<b>Booked by</b>\nNo Email Here\n<br>x')).toBeNull()
    expect(parseBooker(null)).toBeNull()
  })
})

describe('scheduleOf / configuredSchedules', () => {
  it('matches both the current and the renamed schedule by exact prefix', () => {
    expect(scheduleOf('PortalJS meetings (Jane Doe)', DEFAULT_SCHEDULES)).toBe('PortalJS meetings')
    expect(scheduleOf('PortalJS Cloud meetings (Jane Doe)', DEFAULT_SCHEDULES)).toBe('PortalJS Cloud meetings')
  })

  it('ignores other schedules and lookalike titles', () => {
    expect(scheduleOf('Datopian Meetings (Jane Doe)', DEFAULT_SCHEDULES)).toBeNull()
    expect(scheduleOf('Prep: PortalJS meetings (Jane Doe)', DEFAULT_SCHEDULES)).toBeNull()
    expect(scheduleOf('PortalJS meetings', DEFAULT_SCHEDULES)).toBeNull()
  })

  it('reads BOOKING_SCHEDULES as a comma list, defaulting when empty', () => {
    expect(configuredSchedules({ BOOKING_SCHEDULES: ' A , B ,' })).toEqual(['A', 'B'])
    expect(configuredSchedules({})).toEqual(DEFAULT_SCHEDULES)
  })
})

describe('bookingProperties', () => {
  it('sends attribution and shape, never the free-text project description', () => {
    const p = bookingProperties(event(), 'PortalJS meetings', parseBooker(DESC)!)
    expect(p).toMatchObject({
      schedule: 'PortalJS meetings',
      organization: 'City of Example',
      email_domain: 'city.gov.example',
      is_freemail: false,
      heard_from: 'Email from PortalJS',
      has_project_description: true,
      lead_time_hours: 48,
    })
    expect(JSON.stringify(p)).not.toMatch(/Socrata/)
  })
})

describe('eventsFilter', () => {
  it('ORs the schedules and keeps recent-or-upcoming events', () => {
    const f = eventsFilter(['PortalJS meetings', 'PortalJS Cloud meetings'], 'S', 'N')
    expect(f).toBe(
      'and(or(title[ilike]:"PortalJS meetings (%",title[ilike]:"PortalJS Cloud meetings (%"),' +
        'or(externalCreatedAt[gte]:"S",startsAt[gte]:"N"))'
    )
  })
})

// D1 fake covering exactly the statements bookings.ts issues against booked_calls.
interface Row {
  calendar_event_id: string
  distinct_id: string
  cancelled_at: number | null
}
class FakeD1 {
  rows = new Map<string, Row>()
  prepare(sql: string) {
    return new Stmt(this, sql)
  }
}
class Stmt {
  args: any[] = []
  constructor(private db: FakeD1, private sql: string) {}
  bind(...a: any[]) {
    this.args = a
    return this
  }
  async first<T = any>(): Promise<T | null> {
    if (this.sql.includes('COUNT(*)')) return { n: this.db.rows.size } as any
    if (this.sql.includes('WHERE calendar_event_id = ?')) return (this.db.rows.get(this.args[0]) ?? null) as any
    return null
  }
  async run() {
    if (this.sql.startsWith('INSERT')) {
      const [id, , distinct] = this.args
      this.db.rows.set(id, { calendar_event_id: id, distinct_id: distinct, cancelled_at: null })
    } else if (this.sql.startsWith('UPDATE')) {
      const [at, id] = this.args
      this.db.rows.get(id)!.cancelled_at = at
    }
    return { success: true }
  }
}

describe('syncBookings', () => {
  const realFetch = globalThis.fetch
  let events: CalendarEvent[]
  let captured: Array<{ event: string; distinct_id: string; timestamp?: string; properties: any }>
  let twentyUrls: string[]
  let posthogOk: boolean
  let db: FakeD1

  const env = (over: Record<string, unknown> = {}) =>
    ({ DB: db as any, TWENTY_API_TOKEN: 't', POSTHOG_KEY: 'phc_x', BOOKINGS_ENABLED: 'true', ...over }) as any

  beforeEach(() => {
    events = [event()]
    captured = []
    twentyUrls = []
    posthogOk = true
    db = new FakeD1()
    globalThis.fetch = vi.fn(async (url: any, init: any) => {
      const u = String(url)
      if (u.includes('/rest/calendarEvents')) {
        twentyUrls.push(u)
        return new Response(JSON.stringify({ data: { calendarEvents: events } }), { status: 200 })
      }
      captured.push(JSON.parse(init.body))
      return { ok: posthogOk } as Response
    }) as any
  })
  afterEach(() => {
    globalThis.fetch = realFetch
  })

  const NOW = Date.parse('2026-10-02T00:00:00.000Z')

  it('captures call_booked once, at the booking time, under the booker email', async () => {
    const r1 = await syncBookings(env(), NOW)
    const r2 = await syncBookings(env(), NOW)
    expect(r1.booked).toBe(1)
    expect(r2.booked).toBe(0)
    expect(captured).toHaveLength(1)
    expect(captured[0]).toMatchObject({
      event: 'call_booked',
      distinct_id: 'jane.doe@city.gov.example',
      timestamp: '2026-10-01T09:00:00.000Z',
    })
  })

  it('backfills further back on the first run, then uses the short window', async () => {
    await syncBookings(env(), NOW)
    await syncBookings(env(), NOW)
    const since = (u: string) => /externalCreatedAt\[gte\]:"([^"]+)"/.exec(decodeURIComponent(u))![1]
    expect(since(twentyUrls[0])).toBe('2026-06-04T00:00:00.000Z') // 120 days
    expect(since(twentyUrls[1])).toBe('2026-09-18T00:00:00.000Z') // 14 days
  })

  it('reports a later cancellation exactly once', async () => {
    await syncBookings(env(), NOW)
    events = [event({ isCanceled: true })]
    await syncBookings(env(), NOW)
    await syncBookings(env(), NOW)
    expect(captured.map((c) => c.event)).toEqual(['call_booked', 'call_cancelled'])
  })

  it('does not record a booking PostHog rejected, so the next run retries it', async () => {
    posthogOk = false
    await syncBookings(env(), NOW)
    expect(db.rows.size).toBe(0)
    posthogOk = true
    await syncBookings(env(), NOW)
    expect(db.rows.size).toBe(1)
    expect(captured.filter((c) => c.event === 'call_booked')).toHaveLength(2)
  })

  it('skips events from other schedules and ones it cannot parse', async () => {
    events = [event({ id: 'a', title: 'Datopian Meetings (X)' }), event({ id: 'b', description: 'no booking block' })]
    const r = await syncBookings(env(), NOW)
    expect(r).toMatchObject({ scanned: 2, booked: 0, skipped: 2 })
    expect(captured).toHaveLength(0)
  })

  it('dry-runs unless BOOKINGS_ENABLED is "true": no sends, no D1 writes', async () => {
    const r = await syncBookings(env({ BOOKINGS_ENABLED: undefined }), NOW)
    expect(r).toMatchObject({ dryRun: true, booked: 1 })
    expect(captured).toHaveLength(0)
    expect(db.rows.size).toBe(0)
  })

  it('never throws when Twenty is down or unconfigured', async () => {
    globalThis.fetch = vi.fn(async () => new Response('boom', { status: 502 })) as any
    await expect(syncBookings(env(), NOW)).resolves.toMatchObject({ booked: 0 })
    await expect(syncBookings(env({ TWENTY_API_TOKEN: undefined }), NOW)).resolves.toMatchObject({ scanned: 0 })
  })
})
