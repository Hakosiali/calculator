// Centralized badge color classes so status/priority chips look consistent
// across the Clients, Missions, Tasks and Invoices pages.

export const clientStatusStyles: Record<string, string> = {
  actif: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  prospect: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  inactif: 'bg-slate-100 text-slate-600 ring-slate-500/20',
}

export const missionStatusStyles: Record<string, string> = {
  Planifiée: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  'En cours': 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  'En pause': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Terminée: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Annulée: 'bg-rose-50 text-rose-700 ring-rose-600/20',
}

export const taskStatusStyles: Record<string, string> = {
  'À faire': 'bg-slate-100 text-slate-700 ring-slate-500/20',
  'En cours': 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  'En révision': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Terminé: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
}

export const priorityStyles: Record<string, string> = {
  Basse: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  Moyenne: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  Haute: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  Urgente: 'bg-rose-50 text-rose-700 ring-rose-600/20',
}

export const invoiceStatusStyles: Record<string, string> = {
  Payée: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'En attente': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  'En retard': 'bg-rose-50 text-rose-700 ring-rose-600/20',
  Annulée: 'bg-slate-100 text-slate-600 ring-slate-500/20',
}
