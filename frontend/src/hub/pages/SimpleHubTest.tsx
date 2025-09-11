// Simple Hub Test Component
import React from 'react'

export default function SimpleHubTest() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', color: '#22c55e', marginBottom: '1rem' }}>
        🎉 KRINS Developer Hub
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
        Hub er nå tilgjengelig! Du er på: {window.location.pathname}
      </p>
      <div style={{ 
        background: '#f0f9ff', 
        border: '2px solid #22c55e', 
        borderRadius: '8px',
        padding: '1rem',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h2 style={{ color: '#22c55e', marginBottom: '1rem' }}>✅ Test Successful</h2>
        <ul style={{ textAlign: 'left', color: '#333' }}>
          <li>✅ Hub routing fungerer</li>
          <li>✅ Layout og sidebar synlig</li>
          <li>✅ Navigation fra hovedmeny</li>
          <li>✅ URL: http://localhost:5173/hub</li>
        </ul>
      </div>
      <p style={{ marginTop: '2rem', color: '#888', fontSize: '0.9rem' }}>
        Tidspunkt: {new Date().toLocaleString()}
      </p>
    </div>
  )
}