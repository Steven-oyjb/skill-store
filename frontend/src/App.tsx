import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import SkillDetail from './pages/SkillDetail'
import CreateSkill from './pages/CreateSkill'
import SkillEditor from './pages/SkillEditor'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import { ToastProvider, ToastContainer } from './contexts/ToastContext'

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="skills/:id" element={<SkillDetail />} />
            <Route path="skills/:id/edit" element={<SkillEditor />} />
            <Route path="create" element={<CreateSkill />} />
            <Route path="profile" element={<Profile />} />
            <Route path="admin" element={<Admin />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </ToastProvider>
  )
}

export default App
