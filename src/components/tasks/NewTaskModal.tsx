import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '../ui/Modal'
import { dataClient } from '../../lib/dataClient'
import type { Mission, Priority, Task, TeamMember } from '../../types'

interface NewTaskModalProps {
  open: boolean
  onClose: () => void
  onCreated: (task: Task) => void
  /** When set, the mission field is locked to this mission (e.g. from MissionDetail). */
  missionId?: string
}

const PRIORITIES: Priority[] = ['Basse', 'Moyenne', 'Haute', 'Urgente']

const EMPTY_FORM = {
  title: '',
  missionId: '',
  assignee: '',
  priority: 'Moyenne' as Priority,
  dueDate: new Date().toISOString().slice(0, 10),
  description: '',
}

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-500'
const labelClass = 'text-xs font-medium text-slate-600'

export function NewTaskModal({ open, onClose, onCreated, missionId }: NewTaskModalProps) {
  const [form, setForm] = useState({ ...EMPTY_FORM, missionId: missionId ?? '' })
  const [missions, setMissions] = useState<Mission[]>([])
  const [team, setTeam] = useState<TeamMember[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setForm({ ...EMPTY_FORM, missionId: missionId ?? '' })
    setError(null)
    Promise.all([dataClient.missions.list(), dataClient.team.list()]).then(([m, t]) => {
      setMissions(m)
      setTeam(t)
      setForm((prev) => ({ ...prev, assignee: prev.assignee || t[0]?.name || '' }))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, missionId])

  function update<K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleClose() {
    if (submitting) return
    onClose()
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.missionId || !form.assignee || !form.dueDate) {
      setError('Veuillez remplir au minimum le titre, la mission, le responsable et la date d\'échéance.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const task = await dataClient.tasks.create({
        title: form.title.trim(),
        missionId: form.missionId,
        assignee: form.assignee,
        status: 'À faire',
        priority: form.priority,
        dueDate: form.dueDate,
        description: form.description.trim(),
      })
      onCreated(task)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Nouvelle tâche" description="Ajouter une tâche à une mission.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={labelClass}>Titre de la tâche</span>
            <input className={inputClass} value={form.title} onChange={(e) => update('title', e.target.value)} required />
          </label>
          <label className="sm:col-span-2">
            <span className={labelClass}>Mission</span>
            <select
              className={inputClass}
              value={form.missionId}
              onChange={(e) => update('missionId', e.target.value)}
              disabled={Boolean(missionId)}
              required
            >
              <option value="" disabled>
                Sélectionner une mission
              </option>
              {missions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.reference} · {m.title}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Responsable
            <select className={inputClass} value={form.assignee} onChange={(e) => update('assignee', e.target.value)} required>
              {team.map((t) => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Priorité
            <select className={inputClass} value={form.priority} onChange={(e) => update('priority', e.target.value as Priority)}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Échéance
            <input type="date" className={inputClass} value={form.dueDate} onChange={(e) => update('dueDate', e.target.value)} required />
          </label>
          <label className="sm:col-span-2">
            <span className={labelClass}>Description</span>
            <textarea className={inputClass} rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} />
          </label>
        </div>

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Création...' : 'Créer la tâche'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
