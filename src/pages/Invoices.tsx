import { Fragment, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Plus, Receipt, Wallet, Clock, AlertTriangle } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { SearchInput } from '../components/ui/SearchInput'
import { Badge } from '../components/ui/Badge'
import { StatCard } from '../components/ui/StatCard'
import { EmptyState } from '../components/ui/EmptyState'
import { getInvoices, getClients } from '../lib/dataClient'
import { invoiceStatusStyles } from '../lib/badges'
import { formatCurrencyDZD, formatDate } from '../lib/format'
import { invoiceTotal } from '../lib/invoice'
import type { InvoiceStatus } from '../types'

const STATUSES: (InvoiceStatus | 'all')[] = ['all', 'Payée', 'En attente', 'En retard', 'Annulée']

export function Invoices() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<InvoiceStatus | 'all'>('all')
  const [clientId, setClientId] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const invoices = getInvoices()
  const clients = getClients()

  const totals = useMemo(() => {
    const paid = invoices.filter((i) => i.status === 'Payée').reduce((s, i) => s + invoiceTotal(i), 0)
    const pending = invoices.filter((i) => i.status === 'En attente').reduce((s, i) => s + invoiceTotal(i), 0)
    const overdue = invoices.filter((i) => i.status === 'En retard').reduce((s, i) => s + invoiceTotal(i), 0)
    return { paid, pending, overdue }
  }, [invoices])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return invoices.filter((inv) => {
      const client = clients.find((c) => c.id === inv.clientId)
      const matchesQuery = !q || inv.number.toLowerCase().includes(q) || client?.name.toLowerCase().includes(q)
      const matchesStatus = status === 'all' || inv.status === status
      const matchesClient = clientId === 'all' || inv.clientId === clientId
      return matchesQuery && matchesStatus && matchesClient
    })
  }, [invoices, clients, query, status, clientId])

  return (
    <div>
      <PageHeader
        title="Factures"
        description={`${invoices.length} factures émises`}
        actions={
          <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            <Plus className="h-4 w-4" />
            Nouvelle facture
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total encaissé" value={formatCurrencyDZD(totals.paid)} icon={Wallet} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="En attente de paiement" value={formatCurrencyDZD(totals.pending)} icon={Clock} accent="bg-amber-50 text-amber-600" />
        <StatCard label="En retard" value={formatCurrencyDZD(totals.overdue)} icon={AlertTriangle} accent="bg-rose-50 text-rose-600" />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <SearchInput value={query} onChange={setQuery} placeholder="Rechercher par n° de facture, client..." className="sm:max-w-xs" />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as InvoiceStatus | 'all')}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s === 'all' ? 'Tous les statuts' : s}</option>
          ))}
        </select>
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="all">Tous les clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Receipt} title="Aucune facture trouvée" description="Essayez d'ajuster vos filtres de recherche." />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50">
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium"></th>
                <th className="px-5 py-3 font-medium">N° Facture</th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Émission</th>
                <th className="px-5 py-3 font-medium">Échéance</th>
                <th className="px-5 py-3 font-medium">Montant</th>
                <th className="px-5 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((inv) => {
                const client = clients.find((c) => c.id === inv.clientId)
                const isOpen = expanded === inv.id
                return (
                  <Fragment key={inv.id}>
                    <tr
                      onClick={() => setExpanded(isOpen ? null : inv.id)}
                      className="cursor-pointer hover:bg-slate-50"
                    >
                      <td className="px-5 py-3 text-slate-400">
                        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-800">{inv.number}</td>
                      <td className="px-5 py-3 text-slate-600">
                        <Link to={`/clients/${client?.id}`} onClick={(e) => e.stopPropagation()} className="hover:text-indigo-600">
                          {client?.name}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{formatDate(inv.issueDate)}</td>
                      <td className="px-5 py-3 text-slate-600">{formatDate(inv.dueDate)}</td>
                      <td className="px-5 py-3 font-medium text-slate-800">{formatCurrencyDZD(invoiceTotal(inv))}</td>
                      <td className="px-5 py-3">
                        <Badge className={invoiceStatusStyles[inv.status]}>{inv.status}</Badge>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-slate-50/60">
                        <td colSpan={7} className="px-5 py-3">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Détail des prestations</p>
                          <table className="w-full text-xs">
                            <tbody>
                              {inv.items.map((item, idx) => (
                                <tr key={idx} className="text-slate-600">
                                  <td className="py-1 pr-4">{item.description}</td>
                                  <td className="py-1 pr-4">Qté : {item.quantity}</td>
                                  <td className="py-1 text-right font-medium text-slate-800">
                                    {formatCurrencyDZD(item.quantity * item.unitPrice)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
