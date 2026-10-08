import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './lib/AuthProvider.tsx'

// HashRouter (not BrowserRouter) because GitHub Pages is a static host with
// no server-side rewrites: a direct link or refresh on e.g. /missions/m1
// would 404 under BrowserRouter. Hash-based routes (/#/missions/m1) always
// resolve to index.html first, so client-side routing just works.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </StrictMode>,
)
