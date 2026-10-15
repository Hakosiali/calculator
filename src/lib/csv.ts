// Minimal RFC4180-ish CSV parser/writer - handles quoted fields (with
// embedded commas, quotes, and newlines) without pulling in a dependency.
// Good enough for the small, hand-edited spreadsheets this app's import
// features are meant for; not a general-purpose CSV library.

export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0

  // Strip a UTF-8 BOM, which Excel likes to prepend.
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)

  while (i < text.length) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i++
        continue
      }
      field += char
      i++
      continue
    }
    if (char === '"') {
      inQuotes = true
      i++
      continue
    }
    if (char === ',') {
      row.push(field)
      field = ''
      i++
      continue
    }
    if (char === '\r') {
      i++
      continue
    }
    if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      i++
      continue
    }
    field += char
    i++
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''))
}

function csvField(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export function toCsv(rows: string[][]): string {
  return rows.map((row) => row.map(csvField).join(',')).join('\r\n')
}

export function downloadCsv(filename: string, rows: string[][]) {
  const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Parses CSV rows with a header into objects keyed by header name. */
export function csvToObjects(rows: string[][]): Record<string, string>[] {
  if (rows.length === 0) return []
  const [header, ...dataRows] = rows
  const keys = header.map((h) => h.trim())
  return dataRows.map((row) => {
    const obj: Record<string, string> = {}
    keys.forEach((key, i) => {
      obj[key] = (row[i] ?? '').trim()
    })
    return obj
  })
}
