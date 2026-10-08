import { Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { Dashboard } from './pages/Dashboard'
import { Clients } from './pages/Clients'
import { ClientDetail } from './pages/ClientDetail'
import { Missions } from './pages/Missions'
import { MissionDetail } from './pages/MissionDetail'
import { Tasks } from './pages/Tasks'
import { Documents } from './pages/Documents'
import { Invoices } from './pages/Invoices'
import { Calendar } from './pages/Calendar'
import { Assistant } from './pages/Assistant'
import { NotFound } from './pages/NotFound'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/:clientId" element={<ClientDetail />} />
        <Route path="/missions" element={<Missions />} />
        <Route path="/missions/:missionId" element={<MissionDetail />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
