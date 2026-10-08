import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ListChecks } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { SearchInput } from '../components/ui/SearchInput'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { EmptyState } from '../components/ui/EmptyState'
import { dataClient } from '../lib/dataClient'
import { useAsyncData } from '../hooks/useAsyncData'
import { priorityStyles } from '../lib/badges'
import { formatDate, daysUntil } from '../lib/format'
import type { Priority, TaskStatus } from '../types'

const COLUMNS: { status: TaskStatus; accent: string }[] = [
  { status: 'À faire', accent: 'border-t-slate-400' },
  { status: 'En cours', accent: 'border-t-indigo-500' },
  { status: 'En révision', accent: 'border-t-amber-500' },
  { status: 'Terminé', accent: 'border-t-emerald-500' },
]

export function Tasks() {
  const [query, setQuery] = useState('')
  const [assignee, setAssignee] = useState('all')
  const [priority, setPriority] = useState<Priority | 'all'>('all')
  const [overrides, setOverrides] = useState<Record<string, TaskStatus>>({})

  const { data, loading, error } = useAsyncData(
    () => Promise.all([dataClient.tasks.list(), dataClient.missions.list(), dataClient.team.list()]),
    [],
  )
  const tasks = data?.[0] ?? []
  const missions = data?.[1] ?? []
  const team = data?.[2] ?? []

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tasks.filter((t) => {
      const mission = missions.find((m) => m.id === t.missionId)
      const matchesQuery =
        !q || t.title.toLowerCase().includes(q) || mission?.title.toLowerCase().includes(q)
      const matchesAssignee = assignee === 'all' || t.assignee === assignee
      const matchesPriority = priority === 'all' || t.priority === priority
      return matchesQuery && matchesAssignee && matchesPriority
    })
  }, [tasks, missions, query, assignee, priority])

  function effectiveStatus(id: string, fallback: TaskStatus) {
    return overrides[id] ?? fallback
  }

  return (
    <div>
      <PageHeader title="Tâches" description={loading ? 'Chargement...' : `${tasks.length} tâches réparties sur toutes les missions`} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <SearchInput value={query} onChange={setQuery} placeholder="Rechercher une tâche..." className="sm:max-w-xs" />
        <select
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="all">Tous les consultants</option>
          {team.map((m) => (
            <option key={m.id} value={m.name}>{m.name}</option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority | 'all')}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="all">Toutes les priorités</option>
          {(['Urgente', 'Haute', 'Moyenne', 'Basse'] as Priority[]).map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Impossible de charger les tâches ({error.message}). Vérifiez votre configuration Supabase dans .env.local.
        </div>
      )}

      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.status} className="h-80 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={ListChecks} title="Aucune tâche trouvée" description="Essayez d'ajuster vos filtres de recherche." />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => {
            const columnTasks = filtered.filter((t) => effectiveStatus(t.id, t.status) === col.status)
            return (
              <div key={col.status} className={`rounded-xl border border-slate-200 border-t-4 bg-slate-50/60 p-3 ${col.accent}`}>
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="text-sm font-semibold text-slate-700">{col.status}</h2>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                    {columnTasks.length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {columnTasks.map((task) => {
                    const mission = missions.find((m) => m.id === task.missionId)
                    const overdue = daysUntil(task.dueDate) < 0 && col.status !== 'Terminé'
                    return (
                      <div key={task.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium text-slate-800">{task.title}</p>
                          <Badge className={priorityStyles[task.priority]}>{task.priority}</Badge>
                        </div>
                        {mission && (
                          <Link
                            to={`/missions/${mission.id}`}
                            className="mt-1 block truncate text-xs text-indigo-600 hover:text-indigo-700"
                          >
                            {mission.title}
                          </Link>
                        )}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Avatar name={task.assignee} size="sm" />
                            <span className="text-xs text-slate-500">{task.assignee.split(' ')[0]}</span>
                          </div>
                          <span className={`text-xs font-medium ${overdue ? 'text-rose-600' : 'text-slate-400'}`}>
                            {formatDate(task.dueDate)}
                          </span>
                        </div>
                        <select
                          value={effectiveStatus(task.id, task.status)}
                          onChange={(e) =>
                            setOverrides((prev) => ({ ...prev, [task.id]: e.target.value as TaskStatus }))
                          }
                          className="mt-2.5 w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
                        >
                          {COLUMNS.map((c) => (
                            <option key={c.status} value={c.status}>Déplacer vers : {c.status}</option>
                          ))}
                        </select>
                      </div>
                    )
                  })}
                  {columnTasks.length === 0 && (
                    <p className="px-1 py-6 text-center text-xs text-slate-400">Aucune tâche</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
