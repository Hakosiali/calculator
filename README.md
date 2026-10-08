# HRCC — Gestion Interne

Application interne de gestion pour HRCC, cabinet de conseil RH basé en
Algérie. MVP React + TypeScript, interface entièrement en français, avec
données d'exemple réalistes (clients, missions, tâches, documents,
factures, calendrier) et un assistant IA basé sur des règles.

Il ne s'agit pas d'un site vitrine : c'est un tableau de bord privé destiné
aux consultants HRCC.

## Stack technique

- **React 19 + TypeScript + Vite**
- **Tailwind CSS v4** pour le style
- **React Router v7** pour la navigation
- **Recharts** pour les graphiques du tableau de bord
- **date-fns** pour le calendrier
- **lucide-react** pour les icônes

## Démarrer en local

```bash
npm install
npm run dev
```

Autres scripts : `npm run build` (typecheck + build), `npm run lint`
(oxlint), `npm run preview`.

## Structure du projet

```
src/
  types/        Interfaces TypeScript du domaine (Client, Mission, Task, ...)
  data/         Données d'exemple (mock), un fichier par entité
  lib/
    dataClient.ts     Couche d'accès aux données — point d'entrée unique
    supabaseClient.ts Client Supabase + détection "projet configuré ou non"
    database.types.ts Types des tables Supabase (miroir de supabase/schema.sql)
    format.ts         Formatage (devise DZD, dates, initiales...)
    badges.ts         Classes de couleur pour les badges de statut
    assistant.ts      Logique de réponse de l'Assistant IA (mock)
  hooks/
    useAsyncData.ts   Hook { data, loading, error } pour consommer dataClient
  components/
    layout/      Sidebar, Topbar, AppLayout
    ui/          Composants réutilisables (Badge, Avatar, StatCard, ...)
  pages/         Une page par section de la sidebar
supabase/
  schema.sql     Tables + RLS, à exécuter une fois dans un projet Supabase
  seed.sql       Mêmes données que les mocks, générées par scripts/generate-seed.mjs
```

## Données et Supabase

Aucune authentification n'est branchée pour l'instant. Les données, elles,
peuvent venir de deux endroits :

- **Par défaut : données mock locales** (`src/data/*.ts`), zéro
  configuration nécessaire — c'est ce que vous voyez en l'absence de
  variables d'environnement Supabase.
- **Si un projet Supabase est configuré** (voir **[SETUP.md](./SETUP.md)**),
  les mêmes données sont lues en direct depuis votre base. Le pied de la
  barre latérale affiche "Données : démo (locale)" ou "Données : Supabase"
  selon le cas.

Tout passe par `src/lib/dataClient.ts`, dont chaque fonction **retourne une
Promise** (`dataClient.clients.list()`, `dataClient.missions.byClient(id)`,
etc.) : elle interroge Supabase si `isSupabaseConfigured` est vrai, sinon
elle résout depuis les tableaux mock. Toutes les pages, la recherche globale
de la barre du haut et l'Assistant IA consomment déjà ce client asynchrone
via le hook `useAsyncData` (avec états de chargement et d'erreur) — il n'y a
plus aucun accesseur synchrone lisant les mocks directement.

Voir **[SETUP.md](./SETUP.md)** pour créer un projet Supabase, exécuter
`supabase/schema.sql` puis `supabase/seed.sql`, et configurer `.env.local`
(l'authentification et les écritures restent à faire, voir plus bas).
