import { useRef, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { dataClient } from '../../lib/dataClient'
import { csvToObjects, downloadCsv, parseCsv } from '../../lib/csv'
import type { Client, ClientStatus } from '../../types'

interface ImportClientsModalProps {
  open: boolean
  onClose: () => void
  onImported: () => void
}

const TEMPLATE_HEADER = [
  'nom',
  'secteur',
  'wilaya',
  'adresse',
  'contact_nom',
  'contact_fonction',
  'contact_email',
  'contact_telephone',
  'statut',
  'effectif',
  'notes',
]

const TEMPLATE_EXAMPLE = [
  'Exemple SARL',
  'Agroalimentaire',
  'Alger',
  '12 rue des Oliviers, Alger',
  'Nadia Cherif',
  'Directrice Générale',
  'nadia@exemple.dz',
  '0555 00 00 00',
  'prospect',
  '45',
  'Premier contact lors du salon RH 2026.',
]

const VALID_STATUSES: ClientStatus[] = ['actif', 'prospect', 'inactif']

interface ParsedRow {
  line: number
  fields: Record<string, string>
  error: string | null
}

function parseRows(text: string): ParsedRow[] {
  const objects = csvToObjects(parseCsv(text))
  return objects.map((fields, i) => {
    if (!fields.nom?.trim()) return { line: i + 2, fields, error: 'Nom manquant' }
    if (!fields.secteur?.trim()) return { line: i + 2, fields, error: 'Secteur manquant' }
    if (!fields.wilaya?.trim()) return { line: i + 2, fields, error: 'Wilaya manquante' }
    return { line: i + 2, fields, error: null }
  })
}

export function ImportClientsModal({ open, onClose, onImported }: ImportClientsModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ created: number; failed: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleClose() {
    if (importing) return
    setFileName(null)
    setRows([])
    setResult(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    onClose()
  }

  function handleDownloadTemplate() {
    downloadCsv('clients-modele.csv', [TEMPLATE_HEADER, TEMPLATE_EXAMPLE])
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setResult(null)
    setError(null)
    try {
      const text = await file.text()
      setRows(parseRows(text))
    } catch {
      setError('Impossible de lire ce fichier.')
      setRows([])
    }
  }

  const validRows = rows.filter((r) => !r.error)
  const invalidRows = rows.filter((r) => r.error)

  async function handleImport() {
    if (validRows.length === 0) return
    setImporting(true)
    setError(null)
    let created = 0
    let failed = 0
    for (const row of validRows) {
      const f = row.fields
      const status = VALID_STATUSES.includes(f.statut as ClientStatus) ? (f.statut as ClientStatus) : 'prospect'
      try {
        const input: Omit<Client, 'id'> = {
          name: f.nom.trim(),
          sector: f.secteur.trim(),
          wilaya: f.wilaya.trim(),
          address: f.adresse?.trim() ?? '',
          contactName: f.contact_nom?.trim() ?? '',
          contactRole: f.contact_fonction?.trim() ?? '',
          contactEmail: f.contact_email?.trim() ?? '',
          contactPhone: f.contact_telephone?.trim() ?? '',
          status,
          clientSince: new Date().toISOString().slice(0, 10),
          employeeCount: Number(f.effectif) || 0,
          notes: f.notes?.trim() ?? '',
        }
        await dataClient.clients.create(input)
        created++
      } catch {
        failed++
      }
    }
    setImporting(false)
    setResult({ created, failed })
    if (created > 0) onImported()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Importer des clients"
      description="Ajouter plusieurs clients en une fois depuis un fichier CSV (ex. exporté d'Excel)."
    >
      <div className="space-y-4">
        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          <Download className="h-4 w-4" />
          Télécharger le modèle (CSV)
        </button>

        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-slate-200 px-4 py-6 text-center hover:border-indigo-300 hover:bg-indigo-50/30">
          <Upload className="h-6 w-6 text-slate-400" />
          <span className="text-sm text-slate-600">
            {fileName ?? 'Cliquez pour choisir un fichier .csv'}
          </span>
          <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={handleFileChange} className="hidden" />
        </label>

        {rows.length > 0 && !result && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <p className="font-medium text-slate-700">
              {validRows.length} client{validRows.length > 1 ? 's' : ''} prêt{validRows.length > 1 ? 's' : ''} à importer
              {invalidRows.length > 0 && `, ${invalidRows.length} ligne${invalidRows.length > 1 ? 's' : ''} ignorée${invalidRows.length > 1 ? 's' : ''}`}
            </p>
            {invalidRows.length > 0 && (
              <ul className="mt-2 space-y-0.5 text-xs text-rose-600">
                {invalidRows.slice(0, 5).map((r) => (
                  <li key={r.line}>Ligne {r.line} : {r.error}</li>
                ))}
                {invalidRows.length > 5 && <li>... et {invalidRows.length - 5} autre{invalidRows.length - 5 > 1 ? 's' : ''}</li>}
              </ul>
            )}
          </div>
        )}

        {result && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {result.created} client{result.created > 1 ? 's' : ''} importé{result.created > 1 ? 's' : ''}
            {result.failed > 0 && `, ${result.failed} échec${result.failed > 1 ? 's' : ''}`}.
          </div>
        )}

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={importing}
            className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {result ? 'Fermer' : 'Annuler'}
          </button>
          {!result && (
            <button
              type="button"
              onClick={handleImport}
              disabled={importing || validRows.length === 0}
              className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {importing ? 'Importation...' : `Importer (${validRows.length})`}
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
