import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import CreateEvent from './pages/OrganizerFlow/CreateEvent'
import Portal from './pages/OrganizerFlow/Portal'
import Dashboard from './pages/OrganizerFlow/Dashboard'
import EventHome from './pages/GuestFlow/EventHome'
import UploadPhoto from './pages/GuestFlow/UploadPhoto'
import LiveWall from './pages/GuestFlow/LiveWall'
import UpgradeEvent from './pages/OrganizerFlow/UpgradeEvent'
import EventOverview from './pages/OrganizerFlow/EventOverview'
import AdminDashboard from './pages/Admin/AdminDashboard'
import PwaInstallBanner from './components/PwaInstallBanner'
import GlobalOfflineSyncManager from './components/GlobalOfflineSyncManager'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <PwaInstallBanner />
        <GlobalOfflineSyncManager />
        <Routes>
          <Route path="/" element={<CreateEvent />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/portal" element={<Portal />} />
          <Route path="/overview/:eventId" element={<EventOverview />} />
          <Route path="/dashboard/:eventId" element={<Dashboard />} />
          <Route path="/dashboard/:eventId/upgrade" element={<UpgradeEvent />} />
          <Route path="/e/:token" element={<EventHome />} />
          <Route path="/e/:token/upload" element={<UploadPhoto />} />
          <Route path="/e/:token/live" element={<LiveWall />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App

