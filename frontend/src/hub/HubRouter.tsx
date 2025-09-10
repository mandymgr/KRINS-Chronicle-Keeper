// KRINS Developer Hub - Main Router
// Routing for all Hub pages with /hub/* namespace

import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { StandardLayout } from '@/components/shared/Layout'
import '@/styles/design-system.css'

// Lazy load Hub pages for performance
const HubDashboard = React.lazy(() => import('./pages/HubDashboard'))

// Loading component with Kinfolk style
function HubLoading() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
      color: 'var(--color-secondary)',
      fontSize: 'var(--text-sm)',
      letterSpacing: 'var(--tracking-wide)',
      textTransform: 'uppercase'
    }}>
      Loading Hub...
    </div>
  )
}

export default function HubRouter() {
  return (
    <StandardLayout title="KRINS Developer Hub">
      <Suspense fallback={<HubLoading />}>
        <Routes>
          {/* Hub Dashboard - Default */}
          <Route path="/" element={<HubDashboard />} />
          
          {/* Redirect any unknown hub routes to dashboard */}
          <Route path="*" element={<Navigate to="/hub/" replace />} />
        </Routes>
      </Suspense>
    </StandardLayout>
  )
}