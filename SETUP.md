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
   enables Row Level Security requiring a signed-in user (`auth.uid() is
   not null`) for every read and write — see **5. Enable authentication**
   below, since without a logged-in user these policies block everything.
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
vars (instead of **"Données : démo (locale)"**), and the app now gates
every route behind a login screen — see the next section to create an
account.

## 5. Enable authentication

As soon as the two env vars above are set, the app requires a signed-in
user (demo mode, with no env vars, never shows a login screen — see
**How auth interacts with demo mode** below).

1. In your Supabase project, go to **Authentication → Providers** and
   confirm **Email** is enabled (it is by default).
2. There's no public sign-up screen in the app — HRCC is an internal tool,
   so accounts are provisioned by whoever administers the Supabase
   project, not self-served. Create one: **Authentication → Users → Add
   user**, fill in an email and password, and (for the fastest path)
   tick **Auto Confirm User** so it skips email verification.
3. Open the app and sign in with that email/password at `/login` (you're
   redirected there automatically). The sidebar footer then shows the
   signed-in user's email instead of the demo placeholder, with a
   sign-out button next to it.

### How auth interacts with demo mode

`src/lib/AuthProvider.tsx` and `src/components/auth/RequireAuth.tsx` both
check `isSupabaseConfigured` first: with no Supabase project configured,
every route stays open and a synthetic demo user is used everywhere the
UI needs one (the sidebar card), exactly like before this feature existed.
This is what keeps the public GitHub Pages demo open to everyone — the
production build there has no Supabase env vars baked in, so it never
shows a login screen. Auth only turns on once you add real credentials.

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

## Migration status

Done. Every page, the Topbar global search, and the AI Assistant
(`assistant.ts`) all read through the async, Supabase-aware `dataClient`.
There are no more synchronous mock-only getters in `dataClient.ts` — when
a Supabase project is configured, every part of the app reads live data,
with no code left that silently reads mock data instead.

For reference, this is the pattern every migration followed, in case new
pages or components are added later:

1. Call the matching `dataClient.*` method(s), wrapped in `useAsyncData`
   (or, for a component that only needs data once like Topbar, fetched on
   mount and filtered locally).
2. Add a loading state (see the skeletons in `Clients.tsx` /
   `ClientDetail.tsx` for the page pattern) and surface `error` if it's set.
3. Never add a new synchronous mock-only getter to `dataClient.ts` — write
   the async method only.

## Before this goes anywhere real

- **Auth is all-or-nothing today.** Every signed-in user can read and write
  every row — there's no per-consultant or per-role restriction, because
  the data model has no concept of record ownership yet. If HRCC needs
  that later, add a role claim (or a `team_members` → `auth.users` link)
  and tighten the `auth.uid() is not null` checks in `schema.sql`
  accordingly.
- **No password reset / email confirmation flow in the UI.** The login
  page only handles sign-in. Supabase sends its own reset/confirmation
  emails from the dashboard if you need them in the meantime.
- **Writes.** The UI's "Nouveau client", "Nouvelle mission", etc. buttons
  are still inert — only reads are wired up so far.
