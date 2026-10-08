import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Plus } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { SearchInput } from '../components/ui/SearchInput'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { EmptyState } from '../components/ui/EmptyState'
import { dataClient } from '../lib/dataClient'
import { useAsyncData } from '../hooks/useAsyncData'
import { missionStatusStyles, priorityStyles } from '../lib/badges'
import { formatDate } from '../lib/format'
import type { MissionStatus, MissionType } from '../types'

const STATUSES: (MissionStatus | 'all')[] = ['all', 'Planifiée', 'En cours', 'En pause', 'Terminée', 'Annulée']
const TYPES: (MissionType | 'all')[] = [
  'all',
  'Recrutement',
  'Formation',
  'Audit RH',
  'Paie & Administration',
  'Conseil Stratégique',
  'Restructuration',
]

export function Missions() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<MissionStatus | 'all'>('all')
  const [type, setType] = useState<MissionType | 'all'>('all')

  const { data, loading, error } = useAsyncData(
    () => Promise.all([dataClient.missions.list(), dataClient.clients.list()]),
    [],
  )
  const missions = data?.[0] ?? []
  const clients = data?.[1] ?? []

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return missions.filter((m) => {
      const client = clients.find((c) => c.id === m.clientId)
      const matchesQuery =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.reference.toLowerCase().includes(q) ||
        client?.name.toLowerCase().includes(q)
      const matchesStatus = status === 'all' || m.status === status
      const matchesType = type === 'all' || m.type === type
      return matchesQuery && matchesStatus && matchesType
    })
  }, [missions, clients, query, status, type])

  return (
    <div>
      <PageHeader
        title="Missions"
        description={loading ? 'Chargement...' : `${missions.length} missions au total`}
        actions={
          <button className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            <Plus className="h-4 w-4" />
            Nouvelle mission
          </button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <SearchInput value={query} onChange={setQuery} placeholder="Rechercher une mission, un client..." className="sm:max-w-xs" />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as MissionStatus | 'all')}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s === 'all' ? 'Tous les statuts' : s}</option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as MissionType | 'all')}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          {TYPES.map((t) => (
            <option key={t} value={t}>{t === 'all' ? 'Tous les types' : t}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Impossible de charger les missions ({error.message}). Vérifiez votre configuration Supabase dans .env.local.
        </div>
      )}

      {loading ? (
        <div className="mt-6 space-y-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Briefcase} title="Aucune mission trouvée" description="Essayez d'ajuster vos filtres de recherche." />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="bg-slate-50">
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Mission</th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Consultant</th>
                <th className="px-5 py-3 font-medium">Priorité</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3 font-medium">Avancement</th>
                <th className="px-5 py-3 font-medium">Échéance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((m) => {
                const client = clients.find((c) => c.id === m.clientId)
                return (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <Link to={`/missions/${m.id}`} className="font-medium text-slate-800 hover:text-indigo-600">
                        {m.title}
                      </Link>
                      <p className="text-xs text-slate-400">{m.reference} · {m.type}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link to={`/clients/${client?.id}`} className="text-slate-600 hover:text-indigo-600">
                        {client?.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Avatar name={m.consultant} size="sm" />
                        <span className="text-slate-600">{m.consultant}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge className={priorityStyles[m.priority]}>{m.priority}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge className={missionStatusStyles[m.status]}>{m.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-indigo-500" style={{ width: `${m.progress}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{m.progress}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{formatDate(m.endDate)}</td>
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
