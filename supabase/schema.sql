-- HRCC schema. Mirrors the TypeScript interfaces in src/types/index.ts.
-- Run this once in the Supabase SQL editor (or via `supabase db push`)
-- before running seed.sql. See SETUP.md for the full walkthrough.

create table if not exists clients (
  id text primary key,
  name text not null,
  sector text not null,
  wilaya text not null,
  address text not null,
  contact_name text not null,
  contact_role text not null,
  contact_email text not null,
  contact_phone text not null,
  status text not null check (status in ('actif', 'prospect', 'inactif')),
  client_since date not null,
  employee_count integer not null default 0,
  notes text not null default ''
);

create table if not exists missions (
  id text primary key,
  reference text not null unique,
  title text not null,
  client_id text not null references clients (id) on delete cascade,
  type text not null,
  status text not null,
  priority text not null,
  consultant text not null,
  start_date date not null,
  end_date date not null,
  budget numeric not null default 0,
  progress integer not null default 0 check (progress between 0 and 100),
  description text not null default ''
);
create index if not exists missions_client_id_idx on missions (client_id);

create table if not exists tasks (
  id text primary key,
  title text not null,
  mission_id text not null references missions (id) on delete cascade,
  assignee text not null,
  status text not null,
  priority text not null,
  due_date date not null,
  description text not null default ''
);
create index if not exists tasks_mission_id_idx on tasks (mission_id);

create table if not exists documents (
  id text primary key,
  name text not null,
  category text not null,
  client_id text references clients (id) on delete set null,
  mission_id text references missions (id) on delete set null,
  uploaded_by text not null,
  uploaded_date date not null,
  size_kb integer not null default 0,
  format text not null
);
create index if not exists documents_client_id_idx on documents (client_id);
create index if not exists documents_mission_id_idx on documents (mission_id);

create table if not exists invoices (
  id text primary key,
  number text not null unique,
  client_id text not null references clients (id) on delete cascade,
  mission_id text references missions (id) on delete set null,
  status text not null,
  issue_date date not null,
  due_date date not null,
  items jsonb not null default '[]'::jsonb
);
create index if not exists invoices_client_id_idx on invoices (client_id);

create table if not exists calendar_events (
  id text primary key,
  title text not null,
  date date not null,
  time text not null default '00:00',
  type text not null,
  client_id text references clients (id) on delete set null,
  mission_id text references missions (id) on delete set null,
  location text not null default ''
);
create index if not exists calendar_events_date_idx on calendar_events (date);

create table if not exists team_members (
  id text primary key,
  name text not null,
  role text not null,
  initials text not null
);

-- Row Level Security -----------------------------------------------------
-- The app has no authentication yet (by design, see README.md), so these
-- policies allow anyone with the anon key to read and write every table.
-- That is fine for local development against your own project, but before
-- this goes anywhere real: add Supabase Auth, then replace each "true"
-- below with a check against auth.uid() / a role claim.

alter table clients enable row level security;
alter table missions enable row level security;
alter table tasks enable row level security;
alter table documents enable row level security;
alter table invoices enable row level security;
alter table calendar_events enable row level security;
alter table team_members enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['clients', 'missions', 'tasks', 'documents', 'invoices', 'calendar_events', 'team_members']
  loop
    execute format('drop policy if exists "dev_allow_all" on %I', t);
    execute format('create policy "dev_allow_all" on %I for all using (true) with check (true)', t);
  end loop;
end $$;
