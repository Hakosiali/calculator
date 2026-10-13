import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '../ui/Modal'
import { dataClient } from '../../lib/dataClient'
import type { CalendarEvent, CalendarEventType, Client, Mission } from '../../types'

interface EventFormModalProps {
  open: boolean
  onClose: () => void
  onSaved: (event: CalendarEvent) => void
  /** When set, the modal edits this event instead of creating a new one. */
  event?: CalendarEvent
  /** Create mode only: pre-fills the date field, e.g. with the day currently selected on the calendar. */
  defaultDate?: string
}

const TYPES: CalendarEventType[] = ['Réunion', 'Échéance', 'Livraison', 'Entretien', 'Formation']

function emptyForm(defaultDate?: string) {
  return {
    title: '',
    date: defaultDate ?? new Date().toISOString().slice(0, 10),
    time: '09:00',
    type: 'Réunion' as CalendarEventType,
    clientId: '',
    missionId: '',
    location: '',
  }
}

function formFromEvent(event: CalendarEvent): ReturnType<typeof emptyForm> {
  return {
    title: event.title,
    date: event.date,
    time: event.time,
    type: event.type,
    clientId: event.clientId ?? '',
    missionId: event.missionId ?? '',
    location: event.location,
  }
}

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100'
const labelClass = 'text-xs font-medium text-slate-600'

export function EventFormModal({ open, onClose, onSaved, event, defaultDate }: EventFormModalProps) {
  const isEdit = Boolean(event)
  const [form, setForm] = useState(emptyForm(defaultDate))
  const [clients, setClients] = useState<Client[]>([])
  const [missions, setMissions] = useState<Mission[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setForm(event ? formFromEvent(event) : emptyForm(defaultDate))
    setError(null)
    Promise.all([dataClient.clients.list(), dataClient.missions.list()]).then(([c, m]) => {
      setClients(c)
      setMissions(m)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, event?.id, defaultDate])

  function update<K extends keyof ReturnType<typeof emptyForm>>(key: K, value: ReturnType<typeof emptyForm>[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const missionsForClient = missions.filter((m) => !form.clientId || m.clientId === form.clientId)

  function handleClose() {
    if (submitting) return
    onClose()
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.date) {
      setError('Veuillez remplir au minimum le titre et la date.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const fields = {
        title: form.title.trim(),
        date: form.date,
        time: form.time,
        type: form.type,
        clientId: form.clientId || null,
        missionId: form.missionId || null,
        location: form.location.trim(),
      }
      const saved = event ? await dataClient.calendarEvents.update({ ...event, ...fields }) : await dataClient.calendarEvents.create(fields)
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
      title={isEdit ? "Modifier l'événement" : 'Nouvel événement'}
      description={
        isEdit ? 'Mettre à jour les informations de cet événement.' : 'Ajouter une réunion, échéance, formation ou livraison.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={labelClass}>Titre</span>
            <input className={inputClass} value={form.title} onChange={(e) => update('title', e.target.value)} required />
          </label>
          <label className={labelClass}>
            Date
            <input type="date" className={inputClass} value={form.date} onChange={(e) => update('date', e.target.value)} required />
          </label>
          <label className={labelClass}>
            Heure
            <input type="time" className={inputClass} value={form.time} onChange={(e) => update('time', e.target.value)} />
          </label>
          <label className={labelClass}>
            Type
            <select className={inputClass} value={form.type} onChange={(e) => update('type', e.target.value as CalendarEventType)}>
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <div />
          <label className={labelClass}>
            Client (optionnel)
            <select
              className={inputClass}
              value={form.clientId}
              onChange={(e) => update('clientId', e.target.value)}
            >
              <option value="">Aucun</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Mission (optionnel)
            <select className={inputClass} value={form.missionId} onChange={(e) => update('missionId', e.target.value)}>
              <option value="">Aucune</option>
              {missionsForClient.map((m) => (
                <option key={m.id} value={m.id}>{m.reference} · {m.title}</option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className={labelClass}>Lieu</span>
            <input className={inputClass} value={form.location} onChange={(e) => update('location', e.target.value)} />
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
            {submitting ? 'Enregistrement...' : isEdit ? 'Enregistrer' : "Créer l'événement"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
