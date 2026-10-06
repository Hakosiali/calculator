// Core domain types for the HRCC management app.
// Field names mirror the shape we intend to use for future Supabase tables
// (snake_case-friendly ids, ISO date strings) so the mock data layer in
// src/lib/dataClient.ts can be swapped for real Supabase queries later
// without changing anything that consumes it.

export type ClientStatus = 'actif' | 'prospect' | 'inactif'

export interface Client {
  id: string
  name: string
  sector: string
  wilaya: string
  address: string
  contactName: string
  contactRole: string
  contactEmail: string
  contactPhone: string
  status: ClientStatus
  clientSince: string // ISO date
  employeeCount: number
  notes: string
}

export type MissionType =
  | 'Recrutement'
  | 'Formation'
  | 'Audit RH'
  | 'Paie & Administration'
  | 'Conseil Stratégique'
  | 'Restructuration'

export type MissionStatus = 'Planifiée' | 'En cours' | 'En pause' | 'Terminée' | 'Annulée'

export type Priority = 'Basse' | 'Moyenne' | 'Haute' | 'Urgente'

export interface Mission {
  id: string
  reference: string
  title: string
  clientId: string
  type: MissionType
  status: MissionStatus
  priority: Priority
  consultant: string
  startDate: string
  endDate: string
  budget: number // DZD
  progress: number // 0-100
  description: string
}

export type TaskStatus = 'À faire' | 'En cours' | 'En révision' | 'Terminé'

export interface Task {
  id: string
  title: string
  missionId: string
  assignee: string
  status: TaskStatus
  priority: Priority
  dueDate: string
  description: string
}

export type DocumentCategory =
  | 'Contrat'
  | 'Facture'
  | 'Rapport'
  | 'CV'
  | 'Convention'
  | 'Fiche de paie'
  | 'Autre'

export interface AppDocument {
  id: string
  name: string
  category: DocumentCategory
  clientId: string | null
  missionId: string | null
  uploadedBy: string
  uploadedDate: string
  sizeKb: number
  format: 'pdf' | 'docx' | 'xlsx' | 'pptx'
}

export type InvoiceStatus = 'Payée' | 'En attente' | 'En retard' | 'Annulée'

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
}

export interface Invoice {
  id: string
  number: string
  clientId: string
  missionId: string | null
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  items: InvoiceItem[]
}

export type CalendarEventType = 'Réunion' | 'Échéance' | 'Livraison' | 'Entretien' | 'Formation'

export interface CalendarEvent {
  id: string
  title: string
  date: string // ISO date (yyyy-MM-dd)
  time: string // HH:mm
  type: CalendarEventType
  clientId: string | null
  missionId: string | null
  location: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  initials: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}
