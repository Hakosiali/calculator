// Hand-written to match supabase/schema.sql. Once a real project exists,
// regenerate this from it with the Supabase CLI and this file becomes
// redundant:
//   npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts
//
// These must be `type` aliases, not `interface` declarations: the
// supabase-js client generics check each Row/Insert/Update against
// `Record<string, unknown>` in a conditional type, and TypeScript only
// matches that structurally for type aliases - an interface never
// satisfies an index-signature constraint there, even with identical
// members, which otherwise silently collapses every table to `never`.

type ClientRow = {
  id: string
  name: string
  sector: string
  wilaya: string
  address: string
  contact_name: string
  contact_role: string
  contact_email: string
  contact_phone: string
  status: 'actif' | 'prospect' | 'inactif'
  client_since: string
  employee_count: number
  notes: string
}

type MissionRow = {
  id: string
  reference: string
  title: string
  client_id: string
  type: string
  status: string
  priority: string
  consultant: string
  start_date: string
  end_date: string
  budget: number
  progress: number
  description: string
}

type TaskRow = {
  id: string
  title: string
  mission_id: string
  assignee: string
  status: string
  priority: string
  due_date: string
  description: string
}

type DocumentRow = {
  id: string
  name: string
  category: string
  client_id: string | null
  mission_id: string | null
  uploaded_by: string
  uploaded_date: string
  size_kb: number
  format: string
}

type InvoiceRow = {
  id: string
  number: string
  client_id: string
  mission_id: string | null
  status: string
  issue_date: string
  due_date: string
  items: { description: string; quantity: number; unitPrice: number }[]
}

type CalendarEventRow = {
  id: string
  title: string
  date: string
  time: string
  type: string
  client_id: string | null
  mission_id: string | null
  location: string
}

type TeamMemberRow = {
  id: string
  name: string
  role: string
  initials: string
}

// Supabase's generated types give every table an empty `Relationships: []`
// and the schema empty `Views`/`Functions` maps when none are defined. The
// client's generics (see @supabase/supabase-js's GenericSchema/GenericTable)
// require these keys to be present structurally, even when empty, or the
// whole schema silently resolves to `never` - which is what made `.insert()`
// reject every payload before this was added.
export interface Database {
  public: {
    Tables: {
      clients: { Row: ClientRow; Insert: ClientRow; Update: Partial<ClientRow>; Relationships: [] }
      missions: { Row: MissionRow; Insert: MissionRow; Update: Partial<MissionRow>; Relationships: [] }
      tasks: { Row: TaskRow; Insert: TaskRow; Update: Partial<TaskRow>; Relationships: [] }
      documents: { Row: DocumentRow; Insert: DocumentRow; Update: Partial<DocumentRow>; Relationships: [] }
      invoices: { Row: InvoiceRow; Insert: InvoiceRow; Update: Partial<InvoiceRow>; Relationships: [] }
      calendar_events: { Row: CalendarEventRow; Insert: CalendarEventRow; Update: Partial<CalendarEventRow>; Relationships: [] }
      team_members: { Row: TeamMemberRow; Insert: TeamMemberRow; Update: Partial<TeamMemberRow>; Relationships: [] }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
