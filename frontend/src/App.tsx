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
import { Toaster } from '@/components/ui/Toaster'
import HubDashboard from '@/hub/pages/HubDashboard'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Hub Route - MUST be before catch-all */}
        <Route path="/hub" element={
          <ProtectedRoute>
            <Layout>
              <HubDashboard />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
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
            <Layout>
              <UITest />
            </Layout>
          </ProtectedRoute>
        } />
        
        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  )
}

export default App