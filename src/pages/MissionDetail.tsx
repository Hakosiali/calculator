import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Briefcase, Calendar, Wallet, FileText, Plus, Pencil, Trash2, Download } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Avatar } from '../components/ui/Avatar'
import { EmptyState } from '../components/ui/EmptyState'
import { MissionFormModal } from '../components/missions/MissionFormModal'
import { TaskFormModal } from '../components/tasks/TaskFormModal'
import { DocumentFormModal } from '../components/documents/DocumentFormModal'
import { dataClient } from '../lib/dataClient'
import { useAsyncData } from '../hooks/useAsyncData'
import { missionStatusStyles, priorityStyles, taskStatusStyles } from '../lib/badges'
import { formatCurrencyDZD, formatDate } from '../lib/format'
import type { AppDocument, Task, TaskStatus } from '../types'
import { NotFound } from './NotFound'

const TASK_STATUSES: TaskStatus[] = ['À faire', 'En cours', 'En révision', 'Terminé']

export function MissionDetail() {
  const { missionId } = useParams()
  const navigate = useNavigate()
  const [taskStatuses, setTaskStatuses] = useState<Record<string, TaskStatus>>({})
  const [statusError, setStatusError] = useState<string | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)
  const [documentModalOpen, setDocumentModalOpen] = useState(false)
  const [editingDocument, setEditingDocument] = useState<AppDocument | null>(null)
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null)
  const [itemActionError, setItemActionError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const { data, loading, error, refetch } = useAsyncData(async () => {
    if (!missionId) return null
    const mission = await dataClient.missions.get(missionId)
    if (!mission) return { mission: undefined, client: undefined, tasks: [], documents: [] }
    const [client, tasks, documents] = await Promise.all([
      dataClient.clients.get(mission.clientId),
      dataClient.tasks.byMission(missionId),
      dataClient.documents.byMission(missionId),
    ])
    return { mission, client, tasks, documents }
  }, [missionId])

  function statusFor(taskId: string, fallback: TaskStatus) {
    return taskStatuses[taskId] ?? fallback
  }

  async function handleTaskStatusChange(task: Task, status: TaskStatus) {
    setTaskStatuses((prev) => ({ ...prev, [task.id]: status }))
    setStatusError(null)
    try {
      await dataClient.tasks.update({ ...task, status })
    } catch (err) {
      setTaskStatuses((prev) => {
        const next = { ...prev }
        delete next[task.id]
        return next
      })
      setStatusError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    }
  }

  async function handleDeleteTask(task: Task) {
    const confirmed = window.confirm(`Supprimer définitivement la tâche "${task.title}" ? Cette action est irréversible.`)
    if (!confirmed) return
    setDeletingTaskId(task.id)
    setItemActionError(null)
    try {
      await dataClient.tasks.remove(task.id)
      refetch()
    } catch (err) {
      setItemActionError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setDeletingTaskId(null)
    }
  }

  async function handleDownloadDocument(doc: AppDocument) {
    if (!doc.storagePath) return
    try {
      const url = await dataClient.documents.getDownloadUrl(doc.storagePath)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      setItemActionError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    }
  }

  async function handleDeleteDocument(doc: AppDocument) {
    const confirmed = window.confirm(`Supprimer définitivement le document "${doc.name}" ? Cette action est irréversible.`)
    if (!confirmed) return
    setDeletingDocumentId(doc.id)
    setItemActionError(null)
    try {
      await dataClient.documents.remove(doc.id, doc.storagePath)
      refetch()
    } catch (err) {
      setItemActionError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setDeletingDocumentId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
        <div className="h-48 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-xl border border-slate-200 bg-slate-100 lg:col-span-2" />
          <div className="h-48 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        Impossible de charger cette mission ({error.message}). Vérifiez votre configuration Supabase dans .env.local.
      </div>
    )
  }

  if (!data?.mission) return <NotFound />

  const { mission, client, tasks, documents } = data

  async function handleDelete() {
    const confirmed = window.confirm(
      `Supprimer définitivement la mission "${mission.title}" ? Ses tâches seront aussi supprimées. Cette action est irréversible.`,
    )
    if (!confirmed) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await dataClient.missions.remove(mission.id)
      navigate('/missions')
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Une erreur est survenue.')
      setDeleting(false)
    }
  }

  return (
    <div>
      <Link to="/missions" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" />
        Retour aux missions
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">{mission.reference}</p>
              <h1 className="text-lg font-bold text-slate-900 sm:text-xl">{mission.title}</h1>
              <p className="mt-1 text-sm text-slate-500">
                Client :{' '}
                <Link to={`/clients/${client?.id}`} className="font-medium text-indigo-600 hover:text-indigo-700">
                  {client?.name}
                </Link>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={priorityStyles[mission.priority]}>{mission.priority}</Badge>
            <Badge className={missionStatusStyles[mission.status]}>{mission.status}</Badge>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg border border-rose-200 px-3.5 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
            >
              {deleting ? 'Suppression...' : 'Supprimer'}
            </button>
            <button
              onClick={() => setEditModalOpen(true)}
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Modifier
            </button>
          </div>
        </div>

        {deleteError && (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Impossible de supprimer cette mission ({deleteError}).
          </div>
        )}

        <MissionFormModal open={editModalOpen} onClose={() => setEditModalOpen(false)} onSaved={refetch} mission={mission} />

        <p className="mt-4 text-sm leading-relaxed text-slate-600">{mission.description}</p>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-slate-400">Type</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{mission.type}</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs text-slate-400"><Calendar className="h-3.5 w-3.5" /> Période</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{formatDate(mission.startDate)} → {formatDate(mission.endDate)}</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs text-slate-400"><Wallet className="h-3.5 w-3.5" /> Budget</p>
            <p className="mt-1 text-sm font-medium text-slate-800">{formatCurrencyDZD(mission.budget)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Consultant</p>
            <div className="mt-1 flex items-center gap-2">
              <Avatar name={mission.consultant} size="sm" />
              <span className="text-sm font-medium text-slate-800">{mission.consultant}</span>
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Avancement de la mission</span>
            <span className="font-medium text-slate-700">{mission.progress}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${mission.progress}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Tâches ({tasks.length})</h2>
            <button
              onClick={() => setTaskModalOpen(true)}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Nouvelle tâche
            </button>
          </div>

          <TaskFormModal open={taskModalOpen} onClose={() => setTaskModalOpen(false)} onSaved={refetch} missionId={mission.id} />
          <TaskFormModal open={Boolean(editingTask)} onClose={() => setEditingTask(null)} onSaved={refetch} task={editingTask ?? undefined} />

          {statusError && (
            <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              Impossible de mettre à jour le statut ({statusError}).
            </div>
          )}
          {itemActionError && (
            <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {itemActionError}
            </div>
          )}

          {tasks.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">Aucune tâche associée à cette mission.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {tasks.map((task) => {
                const currentStatus = statusFor(task.id, task.status)
                return (
                  <li key={task.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{task.title}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>{task.assignee}</span>
                        <span>·</span>
                        <span>Échéance {formatDate(task.dueDate)}</span>
                        <Badge className={priorityStyles[task.priority]}>{task.priority}</Badge>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <select
                        value={currentStatus}
                        onChange={(e) => handleTaskStatusChange(task, e.target.value as TaskStatus)}
                        className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium ring-1 ring-inset focus:outline-none focus:ring-2 ${taskStatusStyles[currentStatus]}`}
                      >
                        {TASK_STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setEditingTask(task)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                        aria-label="Modifier la tâche"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task)}
                        disabled={deletingTaskId === task.id}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600 disabled:opacity-50"
                        aria-label="Supprimer la tâche"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Documents ({documents.length})</h2>
            <button
              onClick={() => setDocumentModalOpen(true)}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Téléverser
            </button>
          </div>

          <DocumentFormModal
            open={documentModalOpen}
            onClose={() => setDocumentModalOpen(false)}
            onSaved={refetch}
            missionId={mission.id}
            clientId={mission.clientId}
          />
          <DocumentFormModal
            open={Boolean(editingDocument)}
            onClose={() => setEditingDocument(null)}
            onSaved={refetch}
            document={editingDocument ?? undefined}
          />

          {documents.length === 0 ? (
            <div className="mt-3">
              <EmptyState icon={FileText} title="Aucun document" />
            </div>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {documents.map((doc) => (
                <li key={doc.id} className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-slate-700">{doc.name}</p>
                    <p className="text-xs text-slate-400">{formatDate(doc.uploadedDate)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {doc.storagePath && (
                      <button
                        onClick={() => handleDownloadDocument(doc)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                        aria-label="Télécharger le document"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setEditingDocument(doc)}
                      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                      aria-label="Modifier le document"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc)}
                      disabled={deletingDocumentId === doc.id}
                      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600 disabled:opacity-50"
                      aria-label="Supprimer le document"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
