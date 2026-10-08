// Hand-written to match supabase/schema.sql. Once a real project exists,
// regenerate this from it with the Supabase CLI and this file becomes
// redundant:
//   npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
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
        Insert: Database['public']['Tables']['clients']['Row']
        Update: Partial<Database['public']['Tables']['clients']['Row']>
      }
      missions: {
        Row: {
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
        Insert: Database['public']['Tables']['missions']['Row']
        Update: Partial<Database['public']['Tables']['missions']['Row']>
      }
      tasks: {
        Row: {
          id: string
          title: string
          mission_id: string
          assignee: string
          status: string
          priority: string
          due_date: string
          description: string
        }
        Insert: Database['public']['Tables']['tasks']['Row']
        Update: Partial<Database['public']['Tables']['tasks']['Row']>
      }
      documents: {
        Row: {
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
        Insert: Database['public']['Tables']['documents']['Row']
        Update: Partial<Database['public']['Tables']['documents']['Row']>
      }
      invoices: {
        Row: {
          id: string
          number: string
          client_id: string
          mission_id: string | null
          status: string
          issue_date: string
          due_date: string
          items: { description: string; quantity: number; unitPrice: number }[]
        }
        Insert: Database['public']['Tables']['invoices']['Row']
        Update: Partial<Database['public']['Tables']['invoices']['Row']>
      }
      calendar_events: {
        Row: {
          id: string
          title: string
          date: string
          time: string
          type: string
          client_id: string | null
          mission_id: string | null
          location: string
        }
        Insert: Database['public']['Tables']['calendar_events']['Row']
        Update: Partial<Database['public']['Tables']['calendar_events']['Row']>
      }
      team_members: {
        Row: {
          id: string
          name: string
          role: string
          initials: string
        }
        Insert: Database['public']['Tables']['team_members']['Row']
        Update: Partial<Database['public']['Tables']['team_members']['Row']>
      }
    }
  }
}
