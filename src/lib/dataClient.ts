// Data access layer for the HRCC app.
//
// Every read goes through the functions below instead of importing the mock
// arrays directly from page/components. Today they resolve synchronously
// from local mock data; later, each function body can be swapped for a
// Supabase query (e.g. `supabase.from('clients').select('*')`) without
// touching any calling component, since the public signatures already
// return Promises.

import { clients } from '../data/clients'
import { missions } from '../data/missions'
import { tasks } from '../data/tasks'
import { documents } from '../data/documents'
import { invoices } from '../data/invoices'
import { calendarEvents } from '../data/calendarEvents'
import { team } from '../data/team'
import type {
  Client,
  Mission,
  Task,
  AppDocument,
  Invoice,
  CalendarEvent,
  TeamMember,
} from '../types'

function resolve<T>(value: T): Promise<T> {
  // Mimics the async nature of a future Supabase call.
  return Promise.resolve(value)
}

export const dataClient = {
  clients: {
    list: (): Promise<Client[]> => resolve(clients),
    get: (id: string): Promise<Client | undefined> => resolve(clients.find((c) => c.id === id)),
  },
  missions: {
    list: (): Promise<Mission[]> => resolve(missions),
    get: (id: string): Promise<Mission | undefined> => resolve(missions.find((m) => m.id === id)),
    byClient: (clientId: string): Promise<Mission[]> =>
      resolve(missions.filter((m) => m.clientId === clientId)),
  },
  tasks: {
    list: (): Promise<Task[]> => resolve(tasks),
    byMission: (missionId: string): Promise<Task[]> =>
      resolve(tasks.filter((t) => t.missionId === missionId)),
  },
  documents: {
    list: (): Promise<AppDocument[]> => resolve(documents),
    byClient: (clientId: string): Promise<AppDocument[]> =>
      resolve(documents.filter((d) => d.clientId === clientId)),
    byMission: (missionId: string): Promise<AppDocument[]> =>
      resolve(documents.filter((d) => d.missionId === missionId)),
  },
  invoices: {
    list: (): Promise<Invoice[]> => resolve(invoices),
    byClient: (clientId: string): Promise<Invoice[]> =>
      resolve(invoices.filter((i) => i.clientId === clientId)),
  },
  calendarEvents: {
    list: (): Promise<CalendarEvent[]> => resolve(calendarEvents),
  },
  team: {
    list: (): Promise<TeamMember[]> => resolve(team),
  },
}

// Synchronous accessors for components that render immediately from mock
// data without a loading state. These are the ones to replace first with
// a data-fetching hook (e.g. React Query + Supabase) when the backend lands.
export const getClients = () => clients
export const getClient = (id: string) => clients.find((c) => c.id === id)
export const getMissions = () => missions
export const getMission = (id: string) => missions.find((m) => m.id === id)
export const getMissionsByClient = (clientId: string) =>
  missions.filter((m) => m.clientId === clientId)
export const getTasks = () => tasks
export const getTasksByMission = (missionId: string) => tasks.filter((t) => t.missionId === missionId)
export const getDocuments = () => documents
export const getDocumentsByClient = (clientId: string) => documents.filter((d) => d.clientId === clientId)
export const getDocumentsByMission = (missionId: string) => documents.filter((d) => d.missionId === missionId)
export const getInvoices = () => invoices
export const getInvoicesByClient = (clientId: string) => invoices.filter((i) => i.clientId === clientId)
export const getCalendarEvents = () => calendarEvents
export const getTeam = () => team
