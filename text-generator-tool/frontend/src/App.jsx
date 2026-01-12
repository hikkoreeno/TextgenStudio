import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useStore } from './store/useStore'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ToolsPage from './pages/ToolsPage'
import ToolEditorPage from './pages/ToolEditorPage'
import GeneratePage from './pages/GeneratePage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'

function App() {
  const { checkApiStatus, fetchTools } = useStore()

  useEffect(() => {
    checkApiStatus()
    fetchTools()
  }, [])

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/tools/new" element={<ToolEditorPage />} />
          <Route path="/tools/:id/edit" element={<ToolEditorPage />} />
          <Route path="/generate/:id" element={<GeneratePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
