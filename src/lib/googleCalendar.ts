// Builds a Google Calendar "quick add" link - no API, no OAuth, no backend:
// just a URL that pre-fills Google's own event creation form when opened.
// See https://github.com/InteractionDesignFoundation/add-event-to-calendar-docs
import type { CalendarEvent } from '../types'

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function toGoogleDate(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
}

function toGoogleDateTime(d: Date): string {
  return `${toGoogleDate(d)}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}

const DEFAULT_DURATION_MS = 60 * 60 * 1000 // 1h, since HRCC events have no end time of their own

export function googleCalendarUrl(event: CalendarEvent, extraDetails: string[] = []): string {
  const start = new Date(`${event.date}T${event.time}:00`)
  const isAllDay = event.time === '00:00'

  let dates: string
  if (isAllDay) {
    const end = new Date(start)
    end.setDate(end.getDate() + 1) // Google's all-day end date is exclusive
    dates = `${toGoogleDate(start)}/${toGoogleDate(end)}`
  } else {
    const end = new Date(start.getTime() + DEFAULT_DURATION_MS)
    dates = `${toGoogleDateTime(start)}/${toGoogleDateTime(end)}`
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates,
    location: event.location,
    details: [event.type, ...extraDetails].filter(Boolean).join(' — '),
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
