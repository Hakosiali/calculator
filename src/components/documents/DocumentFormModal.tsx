import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Upload } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { dataClient } from '../../lib/dataClient'
import { isSupabaseConfigured } from '../../lib/supabaseClient'
import type { AppDocument, Client, DocumentCategory, Mission, TeamMember } from '../../types'

interface DocumentFormModalProps {
  open: boolean
  onClose: () => void
  onSaved: (document: AppDocument) => void
  /** When set, the modal edits this document instead of creating a new one. */
  document?: AppDocument
  /** Create mode only: locks the client field to this client (e.g. from ClientDetail). */
  clientId?: string
  /** Create mode only: locks the mission field to this mission (e.g. from MissionDetail). */
  missionId?: string
}

const CATEGORIES: DocumentCategory[] = ['Contrat', 'Facture', 'Rapport', 'CV', 'Convention', 'Fiche de paie', 'Autre']
const FORMATS: AppDocument['format'][] = ['pdf', 'docx', 'xlsx', 'pptx']
const KNOWN_EXTENSIONS: Record<string, AppDocument['format']> = { pdf: 'pdf', docx: 'docx', xlsx: 'xlsx', pptx: 'pptx' }

function formatFromFileName(name: string): AppDocument['format'] | null {
  const ext = name.split('.').pop()?.toLowerCase()
  return (ext && KNOWN_EXTENSIONS[ext]) || null
}

function emptyForm(clientId?: string, missionId?: string) {
  return {
    name: '',
    category: 'Autre' as DocumentCategory,
    clientId: clientId ?? '',
    missionId: missionId ?? '',
    uploadedBy: '',
    format: 'pdf' as AppDocument['format'],
    sizeKb: '',
  }
}

function formFromDocument(document: AppDocument): ReturnType<typeof emptyForm> {
  return {
    name: document.name,
    category: document.category,
    clientId: document.clientId ?? '',
    missionId: document.missionId ?? '',
    uploadedBy: document.uploadedBy,
    format: document.format,
    sizeKb: String(document.sizeKb),
  }
}

const inputClass =
  'mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50 disabled:text-slate-500'
const labelClass = 'text-xs font-medium text-slate-600'

export function DocumentFormModal({ open, onClose, onSaved, document, clientId, missionId }: DocumentFormModalProps) {
  const isEdit = Boolean(document)
  const [form, setForm] = useState(emptyForm(clientId, missionId))
  const [clients, setClients] = useState<Client[]>([])
  const [missions, setMissions] = useState<Mission[]>([])
  const [team, setTeam] = useState<TeamMember[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setForm(document ? formFromDocument(document) : emptyForm(clientId, missionId))
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setError(null)
    Promise.all([dataClient.clients.list(), dataClient.missions.list(), dataClient.team.list()]).then(([c, m, t]) => {
      setClients(c)
      setMissions(m)
      setTeam(t)
      setForm((prev) => ({ ...prev, uploadedBy: prev.uploadedBy || t[0]?.name || '' }))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, document?.id, clientId, missionId])

  function update<K extends keyof ReturnType<typeof emptyForm>>(key: K, value: ReturnType<typeof emptyForm>[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleClose() {
    if (submitting) return
    onClose()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null
    setFile(selected)
    if (!selected) return
    const format = formatFromFileName(selected.name)
    setForm((prev) => ({
      ...prev,
      name: prev.name.trim() ? prev.name : selected.name,
      sizeKb: String(Math.max(1, Math.round(selected.size / 1024))),
      format: format ?? prev.format,
    }))
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
      let storagePath = document?.storagePath ?? null
      if (file && isSupabaseConfigured) {
        storagePath = await dataClient.documents.uploadFile(file)
        if (document?.storagePath) {
          dataClient.documents.removeFile(document.storagePath).catch(() => {})
        }
      }
      const fields = {
        name: form.name.trim(),
        category: form.category,
        clientId: form.clientId || null,
        missionId: form.missionId || null,
        uploadedBy: form.uploadedBy,
        sizeKb: Number(form.sizeKb) || 0,
        format: form.format,
        storagePath,
      }
      const saved = document
        ? await dataClient.documents.update({ ...document, ...fields })
        : await dataClient.documents.create({ ...fields, uploadedDate: new Date().toISOString().slice(0, 10) })
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
      title={isEdit ? 'Modifier le document' : 'Nouveau document'}
      description={
        isSupabaseConfigured
          ? isEdit
            ? 'Mettre à jour les informations de ce document, ou le remplacer par un nouveau fichier.'
            : 'Choisir un fichier à téléverser dans le stockage Supabase.'
          : isEdit
            ? 'Mettre à jour les informations de ce document.'
            : 'Enregistrer un document (démo locale : aucun projet Supabase connecté, le fichier lui-même n\'est pas stocké, seulement ses informations).'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {isSupabaseConfigured && (
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-slate-200 px-4 py-6 text-center hover:border-indigo-300 hover:bg-indigo-50/30">
            <Upload className="h-6 w-6 text-slate-400" />
            <span className="text-sm text-slate-600">
              {file?.name ?? (isEdit ? 'Cliquez pour remplacer le fichier (optionnel)' : 'Cliquez pour choisir un fichier')}
            </span>
            <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />
          </label>
        )}
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
              disabled={Boolean(clientId) && !isEdit}
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
              disabled={Boolean(missionId) && !isEdit}
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
            {submitting ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Enregistrer le document'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
