import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './store'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import StudentManagement from './pages/StudentManagement'
import ScholarshipConfig from './pages/ScholarshipConfig'
import EvaluationResults from './pages/EvaluationResults'

export default function App() {
  return (
    <BrowserRouter basename="/scholarship-system">
      <AppProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="students" element={<StudentManagement />} />
            <Route path="scholarships" element={<ScholarshipConfig />} />
            <Route path="evaluation" element={<EvaluationResults />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}
