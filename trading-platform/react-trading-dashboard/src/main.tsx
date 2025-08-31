import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Performance monitoring
if (typeof window.performance !== 'undefined' && window.performance.mark) {
  window.performance.mark('react-start')
}

// Create root and render app
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Mark when React rendering is complete
if (typeof window.performance !== 'undefined' && window.performance.mark) {
  window.performance.mark('react-end')
  window.performance.measure('react-init', 'react-start', 'react-end')
}