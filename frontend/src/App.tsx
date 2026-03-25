import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import SkillDetail from './pages/SkillDetail'
import CreateSkill from './pages/CreateSkill'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="skills/:id" element={<SkillDetail />} />
          <Route path="create" element={<CreateSkill />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
