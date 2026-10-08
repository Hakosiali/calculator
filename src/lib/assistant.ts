// A lightweight rule-based responder standing in for a future LLM-backed
// assistant. It answers common HR-consulting questions by querying the same
// mock data the rest of the app uses, so answers stay consistent with what's
// shown on the Dashboard/Missions/Invoices pages.

import { getClients, getMissions, getTasks, getInvoices } from './dataClient'
import { invoiceTotal } from './invoice'
import { formatCurrencyDZD, formatDate } from './format'

function listOrNone(lines: string[], emptyMessage: string) {
  return lines.length ? lines.map((l) => `• ${l}`).join('\n') : emptyMessage
}

export function answerQuestion(raw: string): string {
  const q = raw.toLowerCase()

  if (/(bonjour|salut|hello|coucou)/.test(q)) {
    return "Bonjour ! Je suis l'assistant HRCC. Je peux répondre à des questions sur vos clients, missions, tâches et factures. Essayez par exemple : « quelles missions sont en retard ? »"
  }

  if (/mission.*(urgent|prioritair)/.test(q) || /urgent.*mission/.test(q)) {
    const missions = getMissions().filter((m) => m.priority === 'Urgente' && m.status !== 'Terminée' && m.status !== 'Annulée')
    const clients = getClients()
    const lines = missions.map((m) => `${m.title} (${clients.find((c) => c.id === m.clientId)?.name}) — échéance ${formatDate(m.endDate)}`)
    return `Missions urgentes en cours :\n${listOrNone(lines, "Aucune mission urgente actuellement, bonne nouvelle !")}`
  }

  if (/combien.*mission|mission.*en cours|nombre de mission/.test(q)) {
    const missions = getMissions()
    const ongoing = missions.filter((m) => m.status === 'En cours').length
    return `Il y a actuellement ${ongoing} mission(s) en cours sur un total de ${missions.length} missions.`
  }

  if (/tâche.*urgent|urgent.*tâche/.test(q)) {
    const tasks = getTasks().filter((t) => t.priority === 'Urgente' && t.status !== 'Terminé')
    const lines = tasks.map((t) => `${t.title} — ${t.assignee}, échéance ${formatDate(t.dueDate)}`)
    return `Tâches urgentes en attente :\n${listOrNone(lines, "Aucune tâche urgente en attente.")}`
  }

  if (/tâche|task/.test(q) && /(assign|charge|qui)/.test(q)) {
    const tasks = getTasks().filter((t) => t.status !== 'Terminé')
    const byAssignee = new Map<string, number>()
    for (const t of tasks) byAssignee.set(t.assignee, (byAssignee.get(t.assignee) ?? 0) + 1)
    const lines = [...byAssignee.entries()].map(([name, count]) => `${name} : ${count} tâche(s) en cours`)
    return `Répartition des tâches actives par consultant :\n${listOrNone(lines, 'Aucune tâche active.')}`
  }

  if (/retard|impayé|impay/.test(q)) {
    const overdue = getInvoices().filter((i) => i.status === 'En retard')
    const clients = getClients()
    const lines = overdue.map(
      (i) => `${i.number} — ${clients.find((c) => c.id === i.clientId)?.name} — ${formatCurrencyDZD(invoiceTotal(i))} (échue le ${formatDate(i.dueDate)})`,
    )
    return `Factures en retard de paiement :\n${listOrNone(lines, "Aucune facture en retard, tout est à jour !")}`
  }

  if (/revenu|chiffre d'affaires|ca |facturation|encaiss/.test(q)) {
    const invoices = getInvoices()
    const paid = invoices.filter((i) => i.status === 'Payée').reduce((s, i) => s + invoiceTotal(i), 0)
    const pending = invoices.filter((i) => i.status === 'En attente').reduce((s, i) => s + invoiceTotal(i), 0)
    const overdue = invoices.filter((i) => i.status === 'En retard').reduce((s, i) => s + invoiceTotal(i), 0)
    return `Total encaissé : ${formatCurrencyDZD(paid)}\nEn attente de paiement : ${formatCurrencyDZD(pending)}\nEn retard : ${formatCurrencyDZD(overdue)}`
  }

  if (/prospect/.test(q)) {
    const prospects = getClients().filter((c) => c.status === 'prospect')
    const lines = prospects.map((c) => `${c.name} (${c.sector}, ${c.wilaya})`)
    return `Clients prospects actuels :\n${listOrNone(lines, 'Aucun prospect enregistré pour le moment.')}`
  }

  if (/client/.test(q) && /(combien|nombre|actif)/.test(q)) {
    const clients = getClients()
    const active = clients.filter((c) => c.status === 'actif').length
    return `HRCC accompagne actuellement ${active} client(s) actif(s) sur un portefeuille total de ${clients.length} entreprises.`
  }

  if (/recrut/.test(q)) {
    const missions = getMissions().filter((m) => m.type === 'Recrutement' && m.status === 'En cours')
    const clients = getClients()
    const lines = missions.map((m) => `${m.title} — ${clients.find((c) => c.id === m.clientId)?.name} (${m.progress}% complété)`)
    return `Missions de recrutement en cours :\n${listOrNone(lines, 'Aucune mission de recrutement en cours.')}`
  }

  return "Je ne suis pas certain de pouvoir répondre précisément à cela pour le moment, mais voici ce que je peux faire : des statistiques sur vos clients, missions, tâches urgentes et factures. Essayez « quelles factures sont en retard ? » ou « combien de missions sont en cours ? »."
}
