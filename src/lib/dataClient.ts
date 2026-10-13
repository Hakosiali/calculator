// Data access layer for the HRCC app.
//
// Every read goes through the functions below instead of importing the mock
// arrays directly from page/components. The `dataClient` object queries
// Supabase when a project is configured (see .env.example / SETUP.md) and
// transparently falls back to the local mock data otherwise, so the app
// keeps working with zero setup. Every consumer (all pages, the Topbar
// global search, the AI Assistant) reads through this async client.

import { clients } from '../data/clients'
import { missions } from '../data/missions'
import { tasks } from '../data/tasks'
import { documents } from '../data/documents'
import { invoices } from '../data/invoices'
import { calendarEvents } from '../data/calendarEvents'
import { team } from '../data/team'
import { supabase, isSupabaseConfigured } from './supabaseClient'
import type { Database } from './database.types'
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
  // Mimics the async nature of a Supabase call, so callers behave the same
  // whether this resolves from mock data or a real query.
  return Promise.resolve(value)
}

// --- Supabase row -> app type mappers (snake_case -> camelCase) ---------

type ClientRow = Database['public']['Tables']['clients']['Row']
type MissionRow = Database['public']['Tables']['missions']['Row']
type TaskRow = Database['public']['Tables']['tasks']['Row']
type DocumentRow = Database['public']['Tables']['documents']['Row']
type InvoiceRow = Database['public']['Tables']['invoices']['Row']
type CalendarEventRow = Database['public']['Tables']['calendar_events']['Row']
type TeamMemberRow = Database['public']['Tables']['team_members']['Row']

function mapClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    sector: row.sector,
    wilaya: row.wilaya,
    address: row.address,
    contactName: row.contact_name,
    contactRole: row.contact_role,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    status: row.status,
    clientSince: row.client_since,
    employeeCount: row.employee_count,
    notes: row.notes,
  }
}

function mapMission(row: MissionRow): Mission {
  return {
    id: row.id,
    reference: row.reference,
    title: row.title,
    clientId: row.client_id,
    type: row.type as Mission['type'],
    status: row.status as Mission['status'],
    priority: row.priority as Mission['priority'],
    consultant: row.consultant,
    startDate: row.start_date,
    endDate: row.end_date,
    budget: row.budget,
    progress: row.progress,
    description: row.description,
  }
}

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    missionId: row.mission_id,
    assignee: row.assignee,
    status: row.status as Task['status'],
    priority: row.priority as Task['priority'],
    dueDate: row.due_date,
    description: row.description,
  }
}

function mapDocument(row: DocumentRow): AppDocument {
  return {
    id: row.id,
    name: row.name,
    category: row.category as AppDocument['category'],
    clientId: row.client_id,
    missionId: row.mission_id,
    uploadedBy: row.uploaded_by,
    uploadedDate: row.uploaded_date,
    sizeKb: row.size_kb,
    format: row.format as AppDocument['format'],
  }
}

function mapInvoice(row: InvoiceRow): Invoice {
  return {
    id: row.id,
    number: row.number,
    clientId: row.client_id,
    missionId: row.mission_id,
    status: row.status as Invoice['status'],
    issueDate: row.issue_date,
    dueDate: row.due_date,
    items: row.items,
  }
}

function mapCalendarEvent(row: CalendarEventRow): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    time: row.time,
    type: row.type as CalendarEvent['type'],
    clientId: row.client_id,
    missionId: row.mission_id,
    location: row.location,
  }
}

function mapTeamMember(row: TeamMemberRow): TeamMember {
  return { id: row.id, name: row.name, role: row.role, initials: row.initials }
}

function unwrap<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message)
  return data as T
}

// --- App type -> Supabase row mappers (camelCase -> snake_case), for writes

function clientToRow(c: Omit<Client, 'id'> & { id: string }): ClientRow {
  return {
    id: c.id,
    name: c.name,
    sector: c.sector,
    wilaya: c.wilaya,
    address: c.address,
    contact_name: c.contactName,
    contact_role: c.contactRole,
    contact_email: c.contactEmail,
    contact_phone: c.contactPhone,
    status: c.status,
    client_since: c.clientSince,
    employee_count: c.employeeCount,
    notes: c.notes,
  }
}

function missionToRow(m: Omit<Mission, 'id'> & { id: string }): MissionRow {
  return {
    id: m.id,
    reference: m.reference,
    title: m.title,
    client_id: m.clientId,
    type: m.type,
    status: m.status,
    priority: m.priority,
    consultant: m.consultant,
    start_date: m.startDate,
    end_date: m.endDate,
    budget: m.budget,
    progress: m.progress,
    description: m.description,
  }
}

// --- Demo-mode delete cascades --------------------------------------------
// Mirrors the foreign-key behaviour declared in supabase/schema.sql (mission
// -> client and task -> mission are `on delete cascade`; document/invoice/
// calendar_events references are `on delete set null`), so deleting a record
// leaves the mock data in the same shape a real Supabase delete would.

function cascadeDeleteMission(missionId: string) {
  for (let i = tasks.length - 1; i >= 0; i--) {
    if (tasks[i].missionId === missionId) tasks.splice(i, 1)
  }
  for (const doc of documents) {
    if (doc.missionId === missionId) doc.missionId = null
  }
  for (const inv of invoices) {
    if (inv.missionId === missionId) inv.missionId = null
  }
  for (const ev of calendarEvents) {
    if (ev.missionId === missionId) ev.missionId = null
  }
}

function cascadeDeleteClient(clientId: string) {
  for (let i = missions.length - 1; i >= 0; i--) {
    if (missions[i].clientId === clientId) {
      cascadeDeleteMission(missions[i].id)
      missions.splice(i, 1)
    }
  }
  for (let i = invoices.length - 1; i >= 0; i--) {
    if (invoices[i].clientId === clientId) invoices.splice(i, 1)
  }
  for (const doc of documents) {
    if (doc.clientId === clientId) doc.clientId = null
  }
  for (const ev of calendarEvents) {
    if (ev.clientId === clientId) ev.clientId = null
  }
}

export const dataClient = {
  clients: {
    list: async (): Promise<Client[]> => {
      if (!isSupabaseConfigured) return resolve(clients)
      const res = await supabase!.from('clients').select('*').order('name')
      return unwrap(res).map(mapClient)
    },
    get: async (id: string): Promise<Client | undefined> => {
      if (!isSupabaseConfigured) return resolve(clients.find((c) => c.id === id))
      const res = await supabase!.from('clients').select('*').eq('id', id).maybeSingle()
      const row = unwrap(res)
      return row ? mapClient(row) : undefined
    },
    create: async (input: Omit<Client, 'id'>): Promise<Client> => {
      const newClient: Client = { ...input, id: crypto.randomUUID() }
      if (!isSupabaseConfigured) {
        clients.push(newClient)
        return resolve(newClient)
      }
      const res = await supabase!.from('clients').insert(clientToRow(newClient)).select().single()
      return mapClient(unwrap(res))
    },
    update: async (client: Client): Promise<Client> => {
      if (!isSupabaseConfigured) {
        const i = clients.findIndex((c) => c.id === client.id)
        if (i === -1) throw new Error('Client introuvable.')
        clients[i] = client
        return resolve(client)
      }
      const res = await supabase!.from('clients').update(clientToRow(client)).eq('id', client.id).select().single()
      return mapClient(unwrap(res))
    },
    remove: async (id: string): Promise<void> => {
      if (!isSupabaseConfigured) {
        cascadeDeleteClient(id)
        const i = clients.findIndex((c) => c.id === id)
        if (i !== -1) clients.splice(i, 1)
        return resolve(undefined)
      }
      const { error } = await supabase!.from('clients').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
  },
  missions: {
    list: async (): Promise<Mission[]> => {
      if (!isSupabaseConfigured) return resolve(missions)
      const res = await supabase!.from('missions').select('*').order('start_date', { ascending: false })
      return unwrap(res).map(mapMission)
    },
    get: async (id: string): Promise<Mission | undefined> => {
      if (!isSupabaseConfigured) return resolve(missions.find((m) => m.id === id))
      const res = await supabase!.from('missions').select('*').eq('id', id).maybeSingle()
      const row = unwrap(res)
      return row ? mapMission(row) : undefined
    },
    byClient: async (clientId: string): Promise<Mission[]> => {
      if (!isSupabaseConfigured) return resolve(missions.filter((m) => m.clientId === clientId))
      const res = await supabase!.from('missions').select('*').eq('client_id', clientId)
      return unwrap(res).map(mapMission)
    },
    create: async (input: Omit<Mission, 'id'>): Promise<Mission> => {
      const newMission: Mission = { ...input, id: crypto.randomUUID() }
      if (!isSupabaseConfigured) {
        missions.push(newMission)
        return resolve(newMission)
      }
      const res = await supabase!.from('missions').insert(missionToRow(newMission)).select().single()
      return mapMission(unwrap(res))
    },
    update: async (mission: Mission): Promise<Mission> => {
      if (!isSupabaseConfigured) {
        const i = missions.findIndex((m) => m.id === mission.id)
        if (i === -1) throw new Error('Mission introuvable.')
        missions[i] = mission
        return resolve(mission)
      }
      const res = await supabase!.from('missions').update(missionToRow(mission)).eq('id', mission.id).select().single()
      return mapMission(unwrap(res))
    },
    remove: async (id: string): Promise<void> => {
      if (!isSupabaseConfigured) {
        cascadeDeleteMission(id)
        const i = missions.findIndex((m) => m.id === id)
        if (i !== -1) missions.splice(i, 1)
        return resolve(undefined)
      }
      const { error } = await supabase!.from('missions').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
  },
  tasks: {
    list: async (): Promise<Task[]> => {
      if (!isSupabaseConfigured) return resolve(tasks)
      const res = await supabase!.from('tasks').select('*')
      return unwrap(res).map(mapTask)
    },
    byMission: async (missionId: string): Promise<Task[]> => {
      if (!isSupabaseConfigured) return resolve(tasks.filter((t) => t.missionId === missionId))
      const res = await supabase!.from('tasks').select('*').eq('mission_id', missionId)
      return unwrap(res).map(mapTask)
    },
  },
  documents: {
    list: async (): Promise<AppDocument[]> => {
      if (!isSupabaseConfigured) return resolve(documents)
      const res = await supabase!.from('documents').select('*').order('uploaded_date', { ascending: false })
      return unwrap(res).map(mapDocument)
    },
    byClient: async (clientId: string): Promise<AppDocument[]> => {
      if (!isSupabaseConfigured) return resolve(documents.filter((d) => d.clientId === clientId))
      const res = await supabase!.from('documents').select('*').eq('client_id', clientId)
      return unwrap(res).map(mapDocument)
    },
    byMission: async (missionId: string): Promise<AppDocument[]> => {
      if (!isSupabaseConfigured) return resolve(documents.filter((d) => d.missionId === missionId))
      const res = await supabase!.from('documents').select('*').eq('mission_id', missionId)
      return unwrap(res).map(mapDocument)
    },
  },
  invoices: {
    list: async (): Promise<Invoice[]> => {
      if (!isSupabaseConfigured) return resolve(invoices)
      const res = await supabase!.from('invoices').select('*').order('issue_date', { ascending: false })
      return unwrap(res).map(mapInvoice)
    },
    byClient: async (clientId: string): Promise<Invoice[]> => {
      if (!isSupabaseConfigured) return resolve(invoices.filter((i) => i.clientId === clientId))
      const res = await supabase!.from('invoices').select('*').eq('client_id', clientId)
      return unwrap(res).map(mapInvoice)
    },
  },
  calendarEvents: {
    list: async (): Promise<CalendarEvent[]> => {
      if (!isSupabaseConfigured) return resolve(calendarEvents)
      const res = await supabase!.from('calendar_events').select('*').order('date')
      return unwrap(res).map(mapCalendarEvent)
    },
  },
  team: {
    list: async (): Promise<TeamMember[]> => {
      if (!isSupabaseConfigured) return resolve(team)
      const res = await supabase!.from('team_members').select('*').order('name')
      return unwrap(res).map(mapTeamMember)
    },
  },
}
