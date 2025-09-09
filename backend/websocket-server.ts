/**
 * 🚀 KRINS WebSocket Server
 * 
 * Real-time synchronization server for organizational intelligence
 * Integrates with existing FastAPI backend and PostgreSQL database
 * 
 * @author KRINS Intelligence System
 */

import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import { KRINSWebSocketSync } from '../TEAM_COLLABORATION/websocket-sync'
import { config } from 'dotenv'

// Load environment variables
config()

const app = express()
const httpServer = createServer(app)

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}))

app.use(express.json())

// Initialize KRINS WebSocket system
const websocketSync = new KRINSWebSocketSync(httpServer)

// Health check endpoint
app.get('/health', (req, res) => {
  const stats = websocketSync.getSystemStats()
  res.json({
    status: 'healthy',
    service: 'KRINS WebSocket Server',
    ...stats
  })
})

// API endpoints for WebSocket management
app.get('/api/websocket/users', (req, res) => {
  const users = websocketSync.getConnectedUsers()
  res.json({
    success: true,
    users,
    count: users.length
  })
})

app.get('/api/websocket/collaborations', (req, res) => {
  const collaborations = websocketSync.getActiveCollaborations()
  res.json({
    success: true,
    collaborations,
    count: collaborations.length
  })
})

app.get('/api/websocket/activity', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50
  const activity = websocketSync.getActivityHistory(limit)
  res.json({
    success: true,
    activity,
    count: activity.length
  })
})

app.post('/api/websocket/broadcast', (req, res) => {
  try {
    const { type, title, message, persistent } = req.body
    
    if (!type || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: type, title, message'
      })
    }

    websocketSync.broadcastSystemNotification({
      type,
      title,
      message,
      persistent
    })

    res.json({
      success: true,
      message: 'Notification broadcasted successfully'
    })
  } catch (error) {
    console.error('❌ Broadcast error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to broadcast notification'
    })
  }
})

app.get('/api/websocket/user/:userId/presence', (req, res) => {
  const { userId } = req.params
  const presence = websocketSync.getUserPresence(userId)
  
  if (presence) {
    res.json({
      success: true,
      presence
    })
  } else {
    res.status(404).json({
      success: false,
      error: 'User not found or offline'
    })
  }
})

// Error handling middleware
app.use((error: any, req: any, res: any, next: any) => {
  console.error('❌ Server error:', error)
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  })
})

// Event listeners for external integration
websocketSync.on('activity', (activity) => {
  console.log(`📊 Activity: ${activity.user} - ${activity.message}`)
  
  // Here you could integrate with:
  // - Database logging
  // - Analytics systems
  // - Notification services
  // - Audit trails
})

websocketSync.on('collaboration', (session) => {
  console.log(`🤝 Collaboration: ${session.participants.length} participants in ${session.adrId}`)
})

const PORT = process.env.WEBSOCKET_PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`🚀 KRINS WebSocket Server running on port ${PORT}`)
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5173"}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🔗 Socket endpoint: ws://localhost:${PORT}/krins-socket`)
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Shutting down KRINS WebSocket Server...')
  httpServer.close(() => {
    console.log('✅ Server closed successfully')
    process.exit(0)
  })
})

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down...')
  httpServer.close(() => {
    process.exit(0)
  })
})

export default app