import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '../ui/Modal'
import { dataClient } from '../../lib/dataClient'
import type { Client, Mission, MissionStatus, MissionType, Priority, TeamMember } from '../../types'

interface MissionFormModalProps {
  open: boolean
  onClose: () => void
  onSaved: (mission: Mission) => void
  /** When set, the modal edits this mission instead of creating a new one. */
  mission?: Mission
  /** When set (create mode only), the client field is locked to this client (e.g. from ClientDetail). */
  clientId?: string
}

const TYPES: MissionType[] = [
  'Recrutement',
  'Formation',
  'Audit RH',
  'Paie & Administration',
  'Conseil Stratégique',
  'Restructuration',
]
const STATUSES: MissionStatus[] = ['Planifiée', 'En cours', 'En pause', 'Terminée', 'Annulée']
const PRIORITIES: Priority[] = ['Basse', 'Moyenne', 'Haute', 'Urgente']

const EMPTY_FORM = {
  title: '',
  clientId: '',
  type: 'Recrutement' as MissionType,
  status: 'Planifiée' as MissionStatus,
  priority: 'Moyenne' as Priority,
  consultant: '',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  budget: '',
  progress: '0',
  description: '',
}

function formFromMission(mission: Mission): typeof EMPTY_FORM {
  return {
    title: mission.title,
    clientId: mission.clientId,
    type: mission.type,
    status: mission.status,
    priority: mission.priority,
    consultant: mission.consultant,
    startDate: mission.startDate,
    endDate: mission.endDate,
    budget: String(mission.budget),
    progress: String(mission.progress),
    description: mission.description,
  }
}

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-500'
const labelClass = 'text-xs font-medium text-slate-600'

function nextReference(existing: Mission[]): string {
  const year = new Date().getFullYear()
  const prefix = `MIS-${year}-`
  const seq = existing.filter((m) => m.reference.startsWith(prefix)).length + 1
  return `${prefix}${String(seq).padStart(3, '0')}`
}

export function MissionFormModal({ open, onClose, onSaved, mission, clientId }: MissionFormModalProps) {
  const isEdit = Boolean(mission)
  const [form, setForm] = useState({ ...EMPTY_FORM, clientId: clientId ?? '' })
  const [clients, setClients] = useState<Client[]>([])
  const [team, setTeam] = useState<TeamMember[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setForm(mission ? formFromMission(mission) : { ...EMPTY_FORM, clientId: clientId ?? '' })
    setError(null)
    Promise.all([dataClient.clients.list(), dataClient.team.list()]).then(([c, t]) => {
      setClients(c)
      setTeam(t)
      setForm((prev) => ({ ...prev, consultant: prev.consultant || t[0]?.name || '' }))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mission?.id, clientId])

  function update<K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleClose() {
    if (submitting) return
    onClose()
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.clientId || !form.consultant || !form.startDate || !form.endDate) {
      setError('Veuillez remplir au minimum le titre, le client, le consultant et les dates.')
      return
    }
    if (form.endDate < form.startDate) {
      setError("La date de fin ne peut pas précéder la date de début.")
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const fields = {
        title: form.title.trim(),
        clientId: form.clientId,
        type: form.type,
        status: form.status,
        priority: form.priority,
        consultant: form.consultant,
        startDate: form.startDate,
        endDate: form.endDate,
        budget: Number(form.budget) || 0,
        description: form.description.trim(),
      }
      const saved = mission
        ? await dataClient.missions.update({
            ...mission,
            ...fields,
            progress: Math.min(100, Math.max(0, Number(form.progress) || 0)),
          })
        : await dataClient.missions.create({
            ...fields,
            reference: nextReference(await dataClient.missions.list()),
            progress: form.status === 'Terminée' ? 100 : 0,
          })
      onSaved(saved)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? 'Modifier la mission' : 'Nouvelle mission'}
      description={isEdit ? 'Mettre à jour les informations de cette mission.' : 'Créer une nouvelle mission pour un client.'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={labelClass}>Titre de la mission</span>
            <input className={inputClass} value={form.title} onChange={(e) => update('title', e.target.value)} required />
          </label>
          <label className={labelClass}>
            Client
            <select
              className={inputClass}
              value={form.clientId}
              onChange={(e) => update('clientId', e.target.value)}
              disabled={Boolean(clientId) && !isEdit}
              required
            >
              <option value="" disabled>
                Sélectionner un client
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Type de mission
            <select className={inputClass} value={form.type} onChange={(e) => update('type', e.target.value as MissionType)}>
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Statut
            <select className={inputClass} value={form.status} onChange={(e) => update('status', e.target.value as MissionStatus)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
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
          <label className="sm:col-span-2">
            <span className={labelClass}>Consultant responsable</span>
            <select className={inputClass} value={form.consultant} onChange={(e) => update('consultant', e.target.value)} required>
              {team.map((t) => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Date de début
            <input type="date" className={inputClass} value={form.startDate} onChange={(e) => update('startDate', e.target.value)} required />
          </label>
          <label className={labelClass}>
            Date de fin
            <input type="date" className={inputClass} value={form.endDate} onChange={(e) => update('endDate', e.target.value)} required />
          </label>
          <label className={labelClass}>
            Budget (DZD)
            <input type="number" min={0} className={inputClass} value={form.budget} onChange={(e) => update('budget', e.target.value)} />
          </label>
          {isEdit && (
            <label className={labelClass}>
              Avancement (%)
              <input
                type="number"
                min={0}
                max={100}
                className={inputClass}
                value={form.progress}
                onChange={(e) => update('progress', e.target.value)}
              />
            </label>
          )}
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
            {submitting ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer la mission'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
