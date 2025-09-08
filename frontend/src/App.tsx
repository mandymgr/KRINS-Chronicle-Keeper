import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { ADRs } from '@/pages/ADRs'
import { Analytics } from '@/pages/Analytics'
import { Intelligence } from '@/pages/Intelligence'
import { Settings } from '@/pages/Settings'
import { UITest } from '@/pages/UITest'
import { Toaster } from '@/components_dev_memory/ui/Toaster'

function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/adrs" element={<ADRs />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/intelligence" element={<Intelligence />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/ui-test" element={<UITest />} />
        </Routes>
      </Layout>
      <Toaster />
    </>
  )
}

export default App