import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import CreateEvent from './pages/OrganizerFlow/CreateEvent'
import Dashboard from './pages/OrganizerFlow/Dashboard'
import EventHome from './pages/GuestFlow/EventHome'
import UploadPhoto from './pages/GuestFlow/UploadPhoto'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CreateEvent />} />
        <Route path="/dashboard/:eventId" element={<Dashboard />} />
        <Route path="/e/:token" element={<EventHome />} />
        <Route path="/e/:token/upload" element={<UploadPhoto />} />
      </Routes>
    </Router>
  )
}

export default App
