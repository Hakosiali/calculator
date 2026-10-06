import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, MapPin, Users, Calendar, Building2, FileText } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import {
  getClient,
  getMissionsByClient,
  getDocumentsByClient,
  getInvoicesByClient,
} from '../lib/dataClient'
import { clientStatusStyles, missionStatusStyles, invoiceStatusStyles } from '../lib/badges'
import { formatCurrencyDZD, formatDate, formatDateLong } from '../lib/format'
import { invoiceTotal } from '../lib/invoice'
import { NotFound } from './NotFound'

export function ClientDetail() {
  const { clientId } = useParams()
  const client = clientId ? getClient(clientId) : undefined

  if (!client) return <NotFound />

  const missions = getMissionsByClient(client.id)
  const documents = getDocumentsByClient(client.id)
  const invoices = getInvoicesByClient(client.id)

  return (
    <div>
      <Link to="/clients" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Retour aux clients
      </Link>

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 sm:text-xl">{client.name}</h1>
              <Badge className={clientStatusStyles[client.status]}>{client.status}</Badge>
            </div>
            <p className="text-sm text-slate-500">{client.sector} · {client.wilaya}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Modifier
          </button>
          <button className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            Nouvelle mission
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800">Contact principal</h2>
            <div className="mt-3 space-y-3 text-sm">
              <p className="font-medium text-slate-800">{client.contactName}</p>
              <p className="text-slate-500">{client.contactRole}</p>
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="h-4 w-4 text-slate-400" />
                <a href={`mailto:${client.contactEmail}`} className="hover:text-indigo-600">{client.contactEmail}</a>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="h-4 w-4 text-slate-400" />
                {client.contactPhone}
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                {client.address}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800">Informations générales</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-slate-500"><Users className="h-4 w-4" /> Effectif</dt>
                <dd className="font-medium text-slate-800">{client.employeeCount} salariés</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-slate-500"><Calendar className="h-4 w-4" /> Client depuis</dt>
                <dd className="font-medium text-slate-800">{formatDateLong(client.clientSince)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800">Notes</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{client.notes}</p>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800">Missions ({missions.length})</h2>
            {missions.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">Aucune mission pour ce client.</p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100">
                {missions.map((m) => (
                  <li key={m.id}>
                    <Link to={`/missions/${m.id}`} className="flex items-center justify-between gap-3 py-3 hover:bg-slate-50 rounded-lg px-2 -mx-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">{m.title}</p>
                        <p className="text-xs text-slate-500">{m.reference} · {m.type}</p>
                      </div>
                      <Badge className={missionStatusStyles[m.status]}>{m.status}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800">Factures ({invoices.length})</h2>
            {invoices.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">Aucune facture pour ce client.</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase tracking-wide text-slate-400">
                      <th className="pb-2 font-medium">N° Facture</th>
                      <th className="pb-2 font-medium">Montant</th>
                      <th className="pb-2 font-medium">Échéance</th>
                      <th className="pb-2 font-medium">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td className="py-2.5 pr-4 font-medium text-slate-800">{inv.number}</td>
                        <td className="py-2.5 pr-4 text-slate-600">{formatCurrencyDZD(invoiceTotal(inv))}</td>
                        <td className="py-2.5 pr-4 text-slate-600">{formatDate(inv.dueDate)}</td>
                        <td className="py-2.5">
                          <Badge className={invoiceStatusStyles[inv.status]}>{inv.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-800">Documents ({documents.length})</h2>
            {documents.length === 0 ? (
              <div className="mt-3">
                <EmptyState icon={FileText} title="Aucun document" description="Les documents liés à ce client apparaîtront ici." />
              </div>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100">
                {documents.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="truncate text-sm text-slate-700">{doc.name}</span>
                    </div>
                    <span className="shrink-0 text-xs text-slate-400">{formatDate(doc.uploadedDate)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
