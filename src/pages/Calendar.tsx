import { useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, MapPin, CalendarDays } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { getCalendarEvents, getClients, getMissions } from '../lib/dataClient'
import type { CalendarEventType } from '../types'

const TODAY = new Date(2026, 9, 6)

const TYPE_STYLES: Record<CalendarEventType, string> = {
  Réunion: 'bg-indigo-100 text-indigo-700',
  Échéance: 'bg-rose-100 text-rose-700',
  Livraison: 'bg-emerald-100 text-emerald-700',
  Entretien: 'bg-amber-100 text-amber-700',
  Formation: 'bg-sky-100 text-sky-700',
}

export function Calendar() {
  const [month, setMonth] = useState(new Date(2026, 9, 1))
  const [selectedDate, setSelectedDate] = useState(format(TODAY, 'yyyy-MM-dd'))

  const events = getCalendarEvents()
  const clients = getClients()
  const missions = getMissions()

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [month])

  const eventsByDate = useMemo(() => {
    const map: Record<string, typeof events> = {}
    for (const e of events) {
      map[e.date] = map[e.date] ? [...map[e.date], e] : [e]
    }
    return map
  }, [events])

  const selectedEvents = (eventsByDate[selectedDate] ?? []).slice().sort((a, b) => a.time.localeCompare(b.time))

  return (
    <div>
      <PageHeader title="Calendrier" description="Réunions, échéances, formations et livraisons" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold capitalize text-slate-800">
              {format(month, 'MMMM yyyy', { locale: fr })}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMonth((m) => subMonths(m, 1))}
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                aria-label="Mois précédent"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setMonth(new Date(2026, 9, 1))}
                className="rounded-md px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Aujourd'hui
              </button>
              <button
                onClick={() => setMonth((m) => addMonths(m, 1))}
                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                aria-label="Mois suivant"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((d) => (
              <div key={d} className="py-1.5">{d}</div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((day) => {
              const key = format(day, 'yyyy-MM-dd')
              const dayEvents = eventsByDate[key] ?? []
              const inMonth = isSameMonth(day, month)
              const isToday = isSameDay(day, TODAY)
              const isSelected = key === selectedDate
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(key)}
                  className={`flex min-h-[86px] flex-col items-start rounded-lg border p-1.5 text-left transition-colors ${
                    isSelected ? 'border-indigo-400 bg-indigo-50' : 'border-transparent hover:bg-slate-50'
                  } ${!inMonth ? 'opacity-40' : ''}`}
                >
                  <span
                    className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isToday ? 'bg-indigo-600 text-white' : 'text-slate-600'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  <div className="flex w-full flex-col gap-0.5">
                    {dayEvents.slice(0, 2).map((e) => (
                      <span
                        key={e.id}
                        className={`truncate rounded px-1 py-0.5 text-[10px] font-medium ${TYPE_STYLES[e.type]}`}
                      >
                        {e.title}
                      </span>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[10px] font-medium text-slate-400">+{dayEvents.length - 2} de plus</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">
            {format(new Date(selectedDate + 'T00:00:00'), 'EEEE d MMMM yyyy', { locale: fr })}
          </h2>
          {selectedEvents.length === 0 ? (
            <div className="mt-3">
              <EmptyState icon={CalendarDays} title="Aucun événement" description="Aucun événement prévu ce jour." />
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {selectedEvents.map((event) => {
                const client = clients.find((c) => c.id === event.clientId)
                const mission = missions.find((m) => m.id === event.missionId)
                return (
                  <li key={event.id} className="rounded-lg border border-slate-100 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800">{event.title}</p>
                      <Badge className={TYPE_STYLES[event.type]}>{event.type}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{event.time !== '00:00' ? event.time : 'Toute la journée'}</p>
                    {client && <p className="mt-1 text-xs text-slate-500">Client : {client.name}</p>}
                    {mission && <p className="text-xs text-slate-500">Mission : {mission.title}</p>}
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="h-3 w-3" /> {event.location}
                    </p>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
