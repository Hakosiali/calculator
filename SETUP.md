# Connecting Supabase

The app runs with zero setup against local mock data (see `src/data/*.ts`).
This page covers the one-time steps to switch it over to a real Supabase
project. Nothing here is required to use or demo the app.

## 1. Create a project

1. Go to [supabase.com](https://supabase.com), sign in, and create a new project.
2. Wait for provisioning to finish, then open **Project Settings → API**.
3. Note down the **Project URL** and the **anon / public** key (not the
   service role key — that one must never reach the browser).

## 2. Create the schema and load the demo data

Open the **SQL Editor** in your Supabase project and run, in order:

1. `supabase/schema.sql` — creates the seven tables (`clients`, `missions`,
   `tasks`, `documents`, `invoices`, `calendar_events`, `team_members`) with
   foreign keys matching the relationships in `src/types/index.ts`, and
   enables Row Level Security with permissive policies (see the note at the
   bottom of that file — tighten these once Supabase Auth is added).
2. `supabase/seed.sql` — loads the exact same 12 clients / 20 missions / 44
   tasks / 26 documents / 16 invoices / 18 calendar events / 6 team members
   used by the local demo, so switching to Supabase doesn't change what you
   see. It's generated from `src/data/*.ts` by `scripts/generate-seed.mjs`;
   re-run that script after editing the mock data if you want the two to
   stay in sync.

(Equivalently, if you use the Supabase CLI: `supabase db push` after
pointing it at your project, or `psql` the two files directly.)

## 3. Point the app at your project

```bash
cp .env.example .env.local
```

Fill in the two values from step 1:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

`.env.local` is git-ignored — these never get committed.

## 4. Run it

```bash
npm run dev
```

The sidebar footer shows **"Données : Supabase"** once it picks up the env
vars (instead of **"Données : démo (locale)"**). Open the Clients page —
it's the one already wired to live queries end to end (list + detail, with
loading and error states) — and confirm it loads from your project.

## How the wiring works

- `src/lib/supabaseClient.ts` creates the client and exports
  `isSupabaseConfigured`, true once both env vars are set.
- `src/lib/dataClient.ts` exports an async `dataClient` object
  (`dataClient.clients.list()`, `dataClient.missions.byClient(id)`, ...).
  Each method queries Supabase when configured, and transparently falls
  back to the local mock arrays otherwise — so the app never breaks for
  someone without a project.
- `src/hooks/useAsyncData.ts` is a small `{ data, loading, error }` hook
  pages use to call `dataClient`.

## Migrating the rest of the pages

**Clients/ClientDetail**, **Missions/MissionDetail** and **Tasks** have been
switched over as the proven pattern. Every other page (Documents, Invoices,
Calendar, the Dashboard, and the global search in Topbar) still reads the
synchronous mock-only getters at the bottom of `dataClient.ts`
(`getDocuments()`, `getInvoices()`, etc.). To migrate one:

1. Replace its synchronous getter call(s) with the matching `dataClient.*`
   call(s), wrapped in `useAsyncData`.
2. Add a loading state (see the skeletons in `Clients.tsx` /
   `ClientDetail.tsx` for the pattern) and surface `error` if it's set.
3. Once nothing in the codebase calls a given sync getter anymore, delete
   it from the bottom of `dataClient.ts`.

## Before this goes anywhere real

- **Auth.** There is none yet — the RLS policies in `schema.sql` allow
  anyone with the anon key to read and write every table. Add Supabase
  Auth, then replace those policies with checks against `auth.uid()` /
  a role claim.
- **Writes.** The UI's "Nouveau client", "Nouvelle mission", etc. buttons
  are still inert — only reads are wired up so far.
