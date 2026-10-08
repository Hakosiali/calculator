import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FileText, FileSpreadsheet, FileType2, Presentation, Upload, FolderOpen } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { SearchInput } from '../components/ui/SearchInput'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { getDocuments, getClients, getMissions } from '../lib/dataClient'
import { formatDate } from '../lib/format'
import type { DocumentCategory } from '../types'

const CATEGORIES: (DocumentCategory | 'all')[] = [
  'all',
  'Contrat',
  'Facture',
  'Rapport',
  'CV',
  'Convention',
  'Fiche de paie',
  'Autre',
]

const FORMAT_ICON = {
  pdf: FileText,
  docx: FileType2,
  xlsx: FileSpreadsheet,
  pptx: Presentation,
}

const FORMAT_COLOR = {
  pdf: 'bg-rose-50 text-rose-600',
  docx: 'bg-sky-50 text-sky-600',
  xlsx: 'bg-emerald-50 text-emerald-600',
  pptx: 'bg-orange-50 text-orange-600',
}

function formatSize(kb: number) {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} Mo`
  return `${kb} Ko`
}

export function Documents() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<DocumentCategory | 'all'>('all')
  const [clientId, setClientId] = useState('all')

  const documents = getDocuments()
  const clients = getClients()
  const missions = getMissions()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return documents.filter((d) => {
      const matchesQuery = !q || d.name.toLowerCase().includes(q)
      const matchesCategory = category === 'all' || d.category === category
      const matchesClient = clientId === 'all' || d.clientId === clientId
      return matchesQuery && matchesCategory && matchesClient
    })
  }, [documents, query, category, clientId])

  return (
    <div>
      <PageHeader
        title="Documents"
        description={`${documents.length} fichiers (contrats, rapports, factures, CV...)`}
        actions={
          <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            <Upload className="h-4 w-4" />
            Téléverser
          </button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <SearchInput value={query} onChange={setQuery} placeholder="Rechercher un document..." className="sm:max-w-xs" />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as DocumentCategory | 'all')}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c === 'all' ? 'Toutes les catégories' : c}</option>
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
          <EmptyState icon={FolderOpen} title="Aucun document trouvé" description="Essayez d'ajuster vos filtres de recherche." />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50">
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Document</th>
                <th className="px-5 py-3 font-medium">Catégorie</th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Mission</th>
                <th className="px-5 py-3 font-medium">Déposé par</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Taille</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((doc) => {
                const Icon = FORMAT_ICON[doc.format]
                const client = clients.find((c) => c.id === doc.clientId)
                const mission = missions.find((m) => m.id === doc.missionId)
                return (
                  <tr key={doc.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${FORMAT_COLOR[doc.format]}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="max-w-[260px] truncate font-medium text-slate-800">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge className="bg-slate-100 text-slate-600 ring-slate-500/20">{doc.category}</Badge>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {client ? (
                        <Link to={`/clients/${client.id}`} className="hover:text-indigo-600">{client.name}</Link>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {mission ? (
                        <Link to={`/missions/${mission.id}`} className="hover:text-indigo-600">{mission.title}</Link>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{doc.uploadedBy}</td>
                    <td className="px-5 py-3 text-slate-600">{formatDate(doc.uploadedDate)}</td>
                    <td className="px-5 py-3 text-slate-500">{formatSize(doc.sizeKb)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
