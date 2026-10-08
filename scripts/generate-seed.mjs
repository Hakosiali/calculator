// One-off generator: converts the TypeScript mock data in src/data/*.ts into
// supabase/seed.sql, so the seed data and the app's demo data can never
// drift apart. Not part of the app build; run manually with:
//   node --experimental-strip-types scripts/generate-seed.mjs
import { writeFileSync } from 'node:fs'
import { clients } from '../src/data/clients.ts'
import { missions } from '../src/data/missions.ts'
import { tasks } from '../src/data/tasks.ts'
import { documents } from '../src/data/documents.ts'
import { invoices } from '../src/data/invoices.ts'
import { calendarEvents } from '../src/data/calendarEvents.ts'
import { team } from '../src/data/team.ts'

function sqlStr(value) {
  if (value === null || value === undefined) return 'null'
  return `'${String(value).replace(/'/g, "''")}'`
}

function sqlNum(value) {
  return String(value)
}

function insertStatement(table, columns, rows) {
  if (rows.length === 0) return ''
  const values = rows.map((row) => `  (${row.join(', ')})`).join(',\n')
  return `insert into ${table} (${columns.join(', ')}) values\n${values}\non conflict (id) do nothing;\n`
}

const out = []

out.push('-- Generated from src/data/*.ts by scripts/generate-seed.mjs. Do not edit by hand.')
out.push('-- Run after schema.sql. See SETUP.md.\n')

out.push(
  insertStatement(
    'clients',
    ['id', 'name', 'sector', 'wilaya', 'address', 'contact_name', 'contact_role', 'contact_email', 'contact_phone', 'status', 'client_since', 'employee_count', 'notes'],
    clients.map((c) => [
      sqlStr(c.id), sqlStr(c.name), sqlStr(c.sector), sqlStr(c.wilaya), sqlStr(c.address),
      sqlStr(c.contactName), sqlStr(c.contactRole), sqlStr(c.contactEmail), sqlStr(c.contactPhone),
      sqlStr(c.status), sqlStr(c.clientSince), sqlNum(c.employeeCount), sqlStr(c.notes),
    ]),
  ),
)

out.push(
  insertStatement(
    'missions',
    ['id', 'reference', 'title', 'client_id', 'type', 'status', 'priority', 'consultant', 'start_date', 'end_date', 'budget', 'progress', 'description'],
    missions.map((m) => [
      sqlStr(m.id), sqlStr(m.reference), sqlStr(m.title), sqlStr(m.clientId), sqlStr(m.type),
      sqlStr(m.status), sqlStr(m.priority), sqlStr(m.consultant), sqlStr(m.startDate), sqlStr(m.endDate),
      sqlNum(m.budget), sqlNum(m.progress), sqlStr(m.description),
    ]),
  ),
)

out.push(
  insertStatement(
    'tasks',
    ['id', 'title', 'mission_id', 'assignee', 'status', 'priority', 'due_date', 'description'],
    tasks.map((t) => [
      sqlStr(t.id), sqlStr(t.title), sqlStr(t.missionId), sqlStr(t.assignee),
      sqlStr(t.status), sqlStr(t.priority), sqlStr(t.dueDate), sqlStr(t.description),
    ]),
  ),
)

out.push(
  insertStatement(
    'documents',
    ['id', 'name', 'category', 'client_id', 'mission_id', 'uploaded_by', 'uploaded_date', 'size_kb', 'format'],
    documents.map((d) => [
      sqlStr(d.id), sqlStr(d.name), sqlStr(d.category), sqlStr(d.clientId), sqlStr(d.missionId),
      sqlStr(d.uploadedBy), sqlStr(d.uploadedDate), sqlNum(d.sizeKb), sqlStr(d.format),
    ]),
  ),
)

out.push(
  insertStatement(
    'invoices',
    ['id', 'number', 'client_id', 'mission_id', 'status', 'issue_date', 'due_date', 'items'],
    invoices.map((i) => [
      sqlStr(i.id), sqlStr(i.number), sqlStr(i.clientId), sqlStr(i.missionId),
      sqlStr(i.status), sqlStr(i.issueDate), sqlStr(i.dueDate),
      `'${JSON.stringify(i.items).replace(/'/g, "''")}'::jsonb`,
    ]),
  ),
)

out.push(
  insertStatement(
    'calendar_events',
    ['id', 'title', 'date', 'time', 'type', 'client_id', 'mission_id', 'location'],
    calendarEvents.map((e) => [
      sqlStr(e.id), sqlStr(e.title), sqlStr(e.date), sqlStr(e.time), sqlStr(e.type),
      sqlStr(e.clientId), sqlStr(e.missionId), sqlStr(e.location),
    ]),
  ),
)

out.push(
  insertStatement(
    'team_members',
    ['id', 'name', 'role', 'initials'],
    team.map((t) => [sqlStr(t.id), sqlStr(t.name), sqlStr(t.role), sqlStr(t.initials)]),
  ),
)

writeFileSync(new URL('../supabase/seed.sql', import.meta.url), out.join('\n'))
console.log('Wrote supabase/seed.sql')
