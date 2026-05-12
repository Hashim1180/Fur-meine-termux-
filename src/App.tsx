import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Login from './pages/Login'
import Admin from './pages/Admin'
import AIAutomation from './pages/AIAutomation'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/ai-automation" element={<AIAutomation />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
