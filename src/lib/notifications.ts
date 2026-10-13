// Computes live alert notifications from current app data. There's no
// persisted notification table - this always reflects the current state
// (overdue tasks/invoices, events coming up), recomputed on every fetch.

import { daysUntil } from './format'
import type { CalendarEvent, Client, Invoice, Mission, Task } from '../types'

export type NotificationSeverity = 'urgent' | 'warning' | 'info'

export interface AppNotification {
  id: string
  severity: NotificationSeverity
  title: string
  description: string
  href: string
  /** ISO date used to sort same-severity notifications, most urgent first. */
  sortDate: string
}

const EVENT_LOOKAHEAD_DAYS = 2
const DUE_SOON_DAYS = 2

export function buildNotifications(
  tasks: Task[],
  missions: Mission[],
  invoices: Invoice[],
  clients: Client[],
  events: CalendarEvent[],
): AppNotification[] {
  const notifications: AppNotification[] = []
  const missionById = new Map(missions.map((m) => [m.id, m]))
  const clientById = new Map(clients.map((c) => [c.id, c]))

  for (const task of tasks) {
    if (task.status === 'Terminé') continue
    const diff = daysUntil(task.dueDate)
    const mission = missionById.get(task.missionId)
    if (diff < 0) {
      notifications.push({
        id: `task-overdue-${task.id}`,
        severity: 'urgent',
        title: task.title,
        description: `En retard de ${Math.abs(diff)} jour${Math.abs(diff) > 1 ? 's' : ''}${mission ? ` · ${mission.title}` : ''}`,
        href: mission ? `/missions/${mission.id}` : '/tasks',
        sortDate: task.dueDate,
      })
    } else if (diff <= DUE_SOON_DAYS) {
      notifications.push({
        id: `task-due-soon-${task.id}`,
        severity: 'warning',
        title: task.title,
        description: `${diff === 0 ? "À faire aujourd'hui" : `À faire dans ${diff} jour${diff > 1 ? 's' : ''}`}${mission ? ` · ${mission.title}` : ''}`,
        href: mission ? `/missions/${mission.id}` : '/tasks',
        sortDate: task.dueDate,
      })
    }
  }

  for (const invoice of invoices) {
    if (invoice.status === 'Payée' || invoice.status === 'Annulée') continue
    const diff = daysUntil(invoice.dueDate)
    const client = clientById.get(invoice.clientId)
    if (invoice.status === 'En retard' || diff < 0) {
      notifications.push({
        id: `invoice-overdue-${invoice.id}`,
        severity: 'urgent',
        title: `Facture ${invoice.number}`,
        description: `En retard de paiement${client ? ` · ${client.name}` : ''}`,
        href: client ? `/clients/${client.id}` : '/invoices',
        sortDate: invoice.dueDate,
      })
    } else if (diff <= DUE_SOON_DAYS) {
      notifications.push({
        id: `invoice-due-soon-${invoice.id}`,
        severity: 'warning',
        title: `Facture ${invoice.number}`,
        description: `${diff === 0 ? "Échéance aujourd'hui" : `Échéance dans ${diff} jour${diff > 1 ? 's' : ''}`}${client ? ` · ${client.name}` : ''}`,
        href: client ? `/clients/${client.id}` : '/invoices',
        sortDate: invoice.dueDate,
      })
    }
  }

  for (const event of events) {
    const diff = daysUntil(event.date)
    if (diff < 0 || diff > EVENT_LOOKAHEAD_DAYS) continue
    notifications.push({
      id: `event-${event.id}`,
      severity: diff === 0 ? 'urgent' : 'info',
      title: event.title,
      description: diff === 0 ? `Aujourd'hui à ${event.time}` : `Dans ${diff} jour${diff > 1 ? 's' : ''} à ${event.time}`,
      href: '/calendar',
      sortDate: event.date,
    })
  }

  const severityRank: Record<NotificationSeverity, number> = { urgent: 0, warning: 1, info: 2 }
  return notifications.sort(
    (a, b) => severityRank[a.severity] - severityRank[b.severity] || a.sortDate.localeCompare(b.sortDate),
  )
}
