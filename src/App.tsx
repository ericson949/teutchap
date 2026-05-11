import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CreateEvent from './pages/OrganizerFlow/CreateEvent'
import Dashboard from './pages/OrganizerFlow/Dashboard'
import EventHome from './pages/GuestFlow/EventHome'
import UploadPhoto from './pages/GuestFlow/UploadPhoto'
import LiveWall from './pages/GuestFlow/LiveWall'
import UpgradeEvent from './pages/OrganizerFlow/UpgradeEvent'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateEvent />} />
        <Route path="/dashboard/:eventId" element={<Dashboard />} />
        <Route path="/dashboard/:eventId/upgrade" element={<UpgradeEvent />} />
        <Route path="/e/:token" element={<EventHome />} />
        <Route path="/e/:token/upload" element={<UploadPhoto />} />
        <Route path="/e/:token/live" element={<LiveWall />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
