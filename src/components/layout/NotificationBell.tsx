import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, AlertCircle, Clock, Info, BellOff } from 'lucide-react'
import { dataClient } from '../../lib/dataClient'
import { useAsyncData } from '../../hooks/useAsyncData'
import { buildNotifications, type NotificationSeverity } from '../../lib/notifications'

const SEVERITY_ICON: Record<NotificationSeverity, typeof AlertCircle> = {
  urgent: AlertCircle,
  warning: Clock,
  info: Info,
}

const SEVERITY_STYLE: Record<NotificationSeverity, string> = {
  urgent: 'bg-rose-50 text-rose-600',
  warning: 'bg-amber-50 text-amber-600',
  info: 'bg-indigo-50 text-indigo-600',
}

const MAX_VISIBLE = 8

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

  const { data } = useAsyncData(
    () =>
      Promise.all([
        dataClient.tasks.list(),
        dataClient.missions.list(),
        dataClient.invoices.list(),
        dataClient.clients.list(),
        dataClient.calendarEvents.list(),
      ]),
    [],
  )

  const notifications = data ? buildNotifications(data[0], data[1], data[2], data[3], data[4]) : []
  const visible = notifications.slice(0, MAX_VISIBLE)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-4 py-2.5">
            <p className="text-sm font-semibold text-slate-800">Notifications</p>
          </div>
          {visible.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <BellOff className="h-5 w-5 text-slate-300" />
              <p className="text-sm text-slate-500">Aucune alerte pour le moment.</p>
            </div>
          ) : (
            <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
              {visible.map((n) => {
                const Icon = SEVERITY_ICON[n.severity]
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => {
                        navigate(n.href)
                        setOpen(false)
                      }}
                      className="flex w-full items-start gap-2.5 px-4 py-2.5 text-left hover:bg-slate-50"
                    >
                      <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${SEVERITY_STYLE[n.severity]}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">{n.title}</p>
                        <p className="truncate text-xs text-slate-500">{n.description}</p>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
          {notifications.length > MAX_VISIBLE && (
            <p className="border-t border-slate-100 px-4 py-2 text-center text-xs text-slate-400">
              +{notifications.length - MAX_VISIBLE} autre{notifications.length - MAX_VISIBLE > 1 ? 's' : ''} alerte
              {notifications.length - MAX_VISIBLE > 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
