import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LoginPage } from '@/components/auth/LoginPage'
import { Layout } from '@/components/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { ADRs } from '@/pages/ADRs'
import { Analytics } from '@/pages/Analytics'
import { Intelligence } from '@/pages/Intelligence'
import { Settings } from '@/pages/Settings'
import { UITest } from '@/pages/UITest'
import { Toaster } from '@/components_dev_memory/ui/Toaster'
import HubRouter from '@/hub/HubRouter'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes */}
        <Route path="/*" element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                
                <Route path="/adrs" element={
                  <ProtectedRoute requiredPermission="adrs:view">
                    <ADRs />
                  </ProtectedRoute>
                } />
                
                <Route path="/analytics" element={
                  <ProtectedRoute requiredPermission="analytics:view">
                    <Analytics />
                  </ProtectedRoute>
                } />
                
                <Route path="/intelligence" element={
                  <ProtectedRoute requiredPermission="intelligence:view">
                    <Intelligence />
                  </ProtectedRoute>
                } />
                
                <Route path="/settings" element={
                  <ProtectedRoute requiredRole={['admin', 'architect']}>
                    <Settings />
                  </ProtectedRoute>
                } />
                
                <Route path="/ui-test" element={
                  <ProtectedRoute requiredRole="admin">
                    <UITest />
                  </ProtectedRoute>
                } />
                
                {/* Developer Hub - Protected route */}
                <Route path="/hub/*" element={
                  <ProtectedRoute requiredPermission="hub:access">
                    <HubRouter />
                  </ProtectedRoute>
                } />
                
                {/* Catch all - redirect to dashboard */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
      <Toaster />
    </AuthProvider>
  )
}

export default App