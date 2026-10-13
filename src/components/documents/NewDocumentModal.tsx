import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '../ui/Modal'
import { dataClient } from '../../lib/dataClient'
import type { AppDocument, Client, DocumentCategory, Mission, TeamMember } from '../../types'

interface NewDocumentModalProps {
  open: boolean
  onClose: () => void
  onCreated: (document: AppDocument) => void
  /** When set, the client field is locked to this client (e.g. from ClientDetail). */
  clientId?: string
  /** When set, the mission field is locked to this mission (e.g. from MissionDetail). */
  missionId?: string
}

const CATEGORIES: DocumentCategory[] = ['Contrat', 'Facture', 'Rapport', 'CV', 'Convention', 'Fiche de paie', 'Autre']
const FORMATS: AppDocument['format'][] = ['pdf', 'docx', 'xlsx', 'pptx']

const EMPTY_FORM = {
  name: '',
  category: 'Autre' as DocumentCategory,
  clientId: '',
  missionId: '',
  uploadedBy: '',
  format: 'pdf' as AppDocument['format'],
  sizeKb: '',
}

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-500'
const labelClass = 'text-xs font-medium text-slate-600'

export function NewDocumentModal({ open, onClose, onCreated, clientId, missionId }: NewDocumentModalProps) {
  const [form, setForm] = useState({ ...EMPTY_FORM, clientId: clientId ?? '', missionId: missionId ?? '' })
  const [clients, setClients] = useState<Client[]>([])
  const [missions, setMissions] = useState<Mission[]>([])
  const [team, setTeam] = useState<TeamMember[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setForm({ ...EMPTY_FORM, clientId: clientId ?? '', missionId: missionId ?? '' })
    setError(null)
    Promise.all([dataClient.clients.list(), dataClient.missions.list(), dataClient.team.list()]).then(([c, m, t]) => {
      setClients(c)
      setMissions(m)
      setTeam(t)
      setForm((prev) => ({ ...prev, uploadedBy: prev.uploadedBy || t[0]?.name || '' }))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, clientId, missionId])

  function update<K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleClose() {
    if (submitting) return
    onClose()
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.uploadedBy) {
      setError('Veuillez remplir au minimum le nom du fichier et le déposant.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const document = await dataClient.documents.create({
        name: form.name.trim(),
        category: form.category,
        clientId: form.clientId || null,
        missionId: form.missionId || null,
        uploadedBy: form.uploadedBy,
        uploadedDate: new Date().toISOString().slice(0, 10),
        sizeKb: Number(form.sizeKb) || 0,
        format: form.format,
      })
      onCreated(document)
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
      title="Nouveau document"
      description="Enregistrer un document (cette démo ne stocke pas le fichier lui-même, seulement ses informations)."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className={labelClass}>Nom du fichier</span>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="ex. Contrat_cadre_2026.pdf"
              required
            />
          </label>
          <label className={labelClass}>
            Catégorie
            <select className={inputClass} value={form.category} onChange={(e) => update('category', e.target.value as DocumentCategory)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Format
            <select className={inputClass} value={form.format} onChange={(e) => update('format', e.target.value as AppDocument['format'])}>
              {FORMATS.map((f) => (
                <option key={f} value={f}>{f.toUpperCase()}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Client
            <select
              className={inputClass}
              value={form.clientId}
              onChange={(e) => update('clientId', e.target.value)}
              disabled={Boolean(clientId)}
            >
              <option value="">Aucun</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Mission
            <select
              className={inputClass}
              value={form.missionId}
              onChange={(e) => update('missionId', e.target.value)}
              disabled={Boolean(missionId)}
            >
              <option value="">Aucune</option>
              {missions.map((m) => (
                <option key={m.id} value={m.id}>{m.reference} · {m.title}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Déposé par
            <select className={inputClass} value={form.uploadedBy} onChange={(e) => update('uploadedBy', e.target.value)} required>
              {team.map((t) => (
                <option key={t.id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </label>
          <label className={labelClass}>
            Taille (Ko)
            <input type="number" min={0} className={inputClass} value={form.sizeKb} onChange={(e) => update('sizeKb', e.target.value)} />
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
            {submitting ? 'Enregistrement...' : 'Enregistrer le document'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
