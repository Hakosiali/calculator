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
    dataClient.ts   Couche d'accès aux données — point d'entrée unique
    format.ts       Formatage (devise DZD, dates, initiales...)
    badges.ts       Classes de couleur pour les badges de statut
    assistant.ts    Logique de réponse de l'Assistant IA (mock)
  components/
    layout/      Sidebar, Topbar, AppLayout
    ui/          Composants réutilisables (Badge, Avatar, StatCard, ...)
  pages/         Une page par section de la sidebar
```

## Données mock et migration future vers Supabase

Aucune authentification ni base de données n'est branchée pour l'instant :
toutes les données vivent dans `src/data/*.ts` et sont servies par
`src/lib/dataClient.ts`.

Ce fichier a volontairement la forme d'un futur client Supabase : chaque
entité expose des fonctions qui **retournent des Promises**
(`dataClient.clients.list()`, `dataClient.missions.byClient(id)`, etc.),
même si elles résolvent aujourd'hui de façon synchrone depuis les tableaux
mock. Quand Supabase sera branché, il suffira de remplacer le corps de ces
fonctions par de vraies requêtes, par exemple :

```ts
// avant (mock)
list: (): Promise<Client[]> => resolve(clients),

// après (Supabase)
list: async (): Promise<Client[]> => {
  const { data, error } = await supabase.from('clients').select('*')
  if (error) throw error
  return data
},
```

Les interfaces TypeScript dans `src/types/index.ts` utilisent déjà des noms
de champs et des types de données (chaînes ISO pour les dates, `id: string`)
compatibles avec des tables Postgres/Supabase, donc elles n'auront pas
besoin d'être réécrites.

Étapes prévues pour le passage à Supabase :

1. Créer les tables Postgres à partir des interfaces de `src/types`.
2. Ajouter `@supabase/supabase-js` et un client dans `src/lib/supabaseClient.ts`.
3. Remplacer les implémentations dans `src/lib/dataClient.ts` par des
   requêtes Supabase (les signatures de fonctions ne changent pas).
4. Ajouter l'authentification (Supabase Auth) et un `AuthProvider` autour
   du routeur dans `src/App.tsx`.
5. Remplacer les accesseurs synchrones (`getClients()`, etc.) par des hooks
   de données (React Query ou équivalent) consommant `dataClient`.
