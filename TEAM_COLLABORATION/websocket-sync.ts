/**
 * 🚀 KRINS WebSocket Synchronization System
 * 
 * Real-time synchronization for organizational intelligence:
 * - Decision updates and status changes
 * - Live collaboration on ADR creation/editing
 * - Team presence and activity awareness
 * - Evidence collection notifications
 * - AI insights broadcasting
 * 
 * @author KRINS Intelligence System
 */

import { Server as SocketServer } from 'socket.io'
import { Server as HttpServer } from 'http'
import { EventEmitter } from 'events'

interface ConnectedUser {
  id: string
  name: string
  role: string
  avatar?: string
  currentPage: string
  status: 'active' | 'idle' | 'away'
  joinedAt: Date
  lastActivity: Date
}

interface DecisionUpdate {
  id: string
  type: 'created' | 'updated' | 'status_changed' | 'evidence_added' | 'deleted'
  adrId: string
  title: string
  status: string
  component?: string
  author: string
  timestamp: Date
  data?: any
}

interface ActivityEvent {
  id: string
  type: 'decision_activity' | 'user_activity' | 'ai_insight' | 'system_event'
  user: string
  message: string
  data?: any
  timestamp: Date
  priority: 'low' | 'medium' | 'high' | 'critical'
}

interface CollaborationSession {
  sessionId: string
  adrId: string
  participants: string[]
  type: 'editing' | 'reviewing' | 'discussion'
  startedAt: Date
  lastActivity: Date
}

/**
 * KRINS WebSocket Synchronization Manager
 */
export class KRINSWebSocketSync extends EventEmitter {
  private io: SocketServer
  private connectedUsers = new Map<string, ConnectedUser>()
  private userSockets = new Map<string, string>() // socketId -> userId
  private collaborationSessions = new Map<string, CollaborationSession>()
  private activityHistory: ActivityEvent[] = []
  private maxActivityHistory = 100

  constructor(httpServer: HttpServer) {
    super()
    
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
      },
      path: '/krins-socket'
    })

    this.setupSocketHandlers()
    this.startPeriodicCleanup()
    
    console.log('🚀 KRINS WebSocket Synchronization System initialized')
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`🔗 New connection: ${socket.id}`)

      // Connection handlers
      socket.on('krins:auth', (data) => this.handleAuthentication(socket, data))
      socket.on('krins:heartbeat', () => this.handleHeartbeat(socket))
      
      // Decision management handlers
      socket.on('krins:decision:join', (data) => this.handleJoinDecision(socket, data))
      socket.on('krins:decision:leave', (data) => this.handleLeaveDecision(socket, data))
      socket.on('krins:decision:update', (data) => this.handleDecisionUpdate(socket, data))
      socket.on('krins:decision:collaborate', (data) => this.handleCollaboration(socket, data))
      
      // Activity and presence handlers
      socket.on('krins:activity:update', (data) => this.handleActivityUpdate(socket, data))
      socket.on('krins:presence:update', (data) => this.handlePresenceUpdate(socket, data))
      socket.on('krins:page:change', (data) => this.handlePageChange(socket, data))
      
      // AI and insights handlers
      socket.on('krins:ai:request', (data) => this.handleAIRequest(socket, data))
      socket.on('krins:insight:broadcast', (data) => this.handleInsightBroadcast(socket, data))
      
      // Evidence collection handlers
      socket.on('krins:evidence:add', (data) => this.handleEvidenceAdd(socket, data))
      socket.on('krins:evidence:update', (data) => this.handleEvidenceUpdate(socket, data))
      
      // Team collaboration handlers
      socket.on('krins:team:message', (data) => this.handleTeamMessage(socket, data))
      socket.on('krins:team:notification', (data) => this.handleTeamNotification(socket, data))
      
      // Disconnect handler
      socket.on('disconnect', () => this.handleDisconnect(socket))
    })
  }

  /**
   * Handle user authentication and registration
   */
  private handleAuthentication(socket: any, data: {
    userId: string
    name: string
    role: string
    avatar?: string
    currentPage: string
  }) {
    try {
      const { userId, name, role, avatar, currentPage } = data

      const user: ConnectedUser = {
        id: userId,
        name,
        role,
        avatar,
        currentPage,
        status: 'active',
        joinedAt: new Date(),
        lastActivity: new Date()
      }

      // Store user connection
      this.connectedUsers.set(userId, user)
      this.userSockets.set(socket.id, userId)

      // Join user to personal room and global room
      socket.join(`user:${userId}`)
      socket.join('krins:global')
      socket.join(`page:${currentPage}`)

      // Acknowledge authentication
      socket.emit('krins:auth:success', {
        user,
        onlineUsers: Array.from(this.connectedUsers.values()),
        recentActivity: this.activityHistory.slice(-20)
      })

      // Broadcast user online status
      this.broadcastUserPresence(userId, 'joined')

      // Create activity event
      this.createActivityEvent({
        type: 'user_activity',
        user: name,
        message: `${name} joined the system`,
        priority: 'low'
      })

      console.log(`✅ User authenticated: ${name} (${role})`)
    } catch (error) {
      console.error('❌ Authentication error:', error)
      socket.emit('krins:error', { message: 'Authentication failed' })
    }
  }

  /**
   * Handle heartbeat to keep connection alive
   */
  private handleHeartbeat(socket: any) {
    const userId = this.userSockets.get(socket.id)
    if (userId) {
      const user = this.connectedUsers.get(userId)
      if (user) {
        user.lastActivity = new Date()
        user.status = 'active'
        this.connectedUsers.set(userId, user)
      }
    }
    socket.emit('krins:heartbeat:ack')
  }

  /**
   * Handle joining a decision for collaboration
   */
  private handleJoinDecision(socket: any, data: { adrId: string, sessionType: 'editing' | 'reviewing' | 'discussion' }) {
    try {
      const userId = this.userSockets.get(socket.id)
      if (!userId) return

      const { adrId, sessionType } = data
      const roomName = `decision:${adrId}`

      // Join decision room
      socket.join(roomName)

      // Create or update collaboration session
      const sessionId = `${adrId}:${sessionType}`
      let session = this.collaborationSessions.get(sessionId)

      if (!session) {
        session = {
          sessionId,
          adrId,
          participants: [userId],
          type: sessionType,
          startedAt: new Date(),
          lastActivity: new Date()
        }
      } else {
        if (!session.participants.includes(userId)) {
          session.participants.push(userId)
        }
        session.lastActivity = new Date()
      }

      this.collaborationSessions.set(sessionId, session)

      // Notify room about new participant
      socket.to(roomName).emit('krins:decision:participant:joined', {
        userId,
        user: this.connectedUsers.get(userId),
        adrId,
        sessionType,
        participants: session.participants.map(id => this.connectedUsers.get(id)).filter(Boolean)
      })

      // Acknowledge join
      socket.emit('krins:decision:joined', {
        adrId,
        sessionType,
        participants: session.participants.map(id => this.connectedUsers.get(id)).filter(Boolean)
      })

      console.log(`🤝 User ${userId} joined decision ${adrId} for ${sessionType}`)
    } catch (error) {
      console.error('❌ Error joining decision:', error)
      socket.emit('krins:error', { message: 'Failed to join decision' })
    }
  }

  /**
   * Handle leaving a decision collaboration
   */
  private handleLeaveDecision(socket: any, data: { adrId: string, sessionType: 'editing' | 'reviewing' | 'discussion' }) {
    try {
      const userId = this.userSockets.get(socket.id)
      if (!userId) return

      const { adrId, sessionType } = data
      const roomName = `decision:${adrId}`
      const sessionId = `${adrId}:${sessionType}`

      // Leave decision room
      socket.leave(roomName)

      // Update collaboration session
      const session = this.collaborationSessions.get(sessionId)
      if (session) {
        session.participants = session.participants.filter(id => id !== userId)
        
        if (session.participants.length === 0) {
          this.collaborationSessions.delete(sessionId)
        } else {
          session.lastActivity = new Date()
          this.collaborationSessions.set(sessionId, session)
        }
      }

      // Notify room about participant leaving
      socket.to(roomName).emit('krins:decision:participant:left', {
        userId,
        adrId,
        sessionType,
        participants: session?.participants.map(id => this.connectedUsers.get(id)).filter(Boolean) || []
      })

      console.log(`👋 User ${userId} left decision ${adrId}`)
    } catch (error) {
      console.error('❌ Error leaving decision:', error)
    }
  }

  /**
   * Handle decision updates and broadcast to relevant users
   */
  private handleDecisionUpdate(socket: any, data: DecisionUpdate) {
    try {
      const userId = this.userSockets.get(socket.id)
      if (!userId) return

      const user = this.connectedUsers.get(userId)
      if (!user) return

      // Broadcast to decision room and global room
      const roomName = `decision:${data.adrId}`
      this.io.to(roomName).emit('krins:decision:updated', {
        ...data,
        updatedBy: user
      })

      this.io.to('krins:global').emit('krins:decision:notification', {
        type: 'decision_updated',
        adrId: data.adrId,
        title: data.title,
        updateType: data.type,
        user: user.name,
        timestamp: data.timestamp || new Date()
      })

      // Create activity event
      this.createActivityEvent({
        type: 'decision_activity',
        user: user.name,
        message: `${data.type.replace('_', ' ')} ADR: ${data.title}`,
        data: { adrId: data.adrId, updateType: data.type },
        priority: data.type === 'created' ? 'high' : 'medium'
      })

      console.log(`📋 Decision update: ${data.type} for ${data.adrId} by ${user.name}`)
    } catch (error) {
      console.error('❌ Error handling decision update:', error)
    }
  }

  /**
   * Handle real-time collaboration events
   */
  private handleCollaboration(socket: any, data: {
    adrId: string
    action: 'cursor_move' | 'text_select' | 'edit_start' | 'edit_end'
    position?: { line: number, column: number }
    selection?: { start: number, end: number }
    content?: string
  }) {
    try {
      const userId = this.userSockets.get(socket.id)
      if (!userId) return

      const roomName = `decision:${data.adrId}`
      
      // Broadcast collaboration event to other participants
      socket.to(roomName).emit('krins:decision:collaboration', {
        userId,
        user: this.connectedUsers.get(userId),
        ...data,
        timestamp: new Date()
      })
    } catch (error) {
      console.error('❌ Error handling collaboration:', error)
    }
  }

  /**
   * Handle activity updates
   */
  private handleActivityUpdate(socket: any, data: {
    action: string
    target?: string
    metadata?: any
  }) {
    try {
      const userId = this.userSockets.get(socket.id)
      if (!userId) return

      const user = this.connectedUsers.get(userId)
      if (!user) return

      // Update user last activity
      user.lastActivity = new Date()
      this.connectedUsers.set(userId, user)

      // Create activity event if significant
      if (this.isSignificantActivity(data.action)) {
        this.createActivityEvent({
          type: 'user_activity',
          user: user.name,
          message: `${data.action} ${data.target || ''}`.trim(),
          data: data.metadata,
          priority: 'low'
        })
      }
    } catch (error) {
      console.error('❌ Error handling activity update:', error)
    }
  }

  /**
   * Handle user presence updates
   */
  private handlePresenceUpdate(socket: any, data: {
    status: 'active' | 'idle' | 'away'
  }) {
    try {
      const userId = this.userSockets.get(socket.id)
      if (!userId) return

      const user = this.connectedUsers.get(userId)
      if (!user) return

      user.status = data.status
      user.lastActivity = new Date()
      this.connectedUsers.set(userId, user)

      // Broadcast presence update
      this.broadcastUserPresence(userId, 'status_changed')
    } catch (error) {
      console.error('❌ Error handling presence update:', error)
    }
  }

  /**
   * Handle page changes
   */
  private handlePageChange(socket: any, data: { from: string, to: string }) {
    try {
      const userId = this.userSockets.get(socket.id)
      if (!userId) return

      const user = this.connectedUsers.get(userId)
      if (!user) return

      // Leave old page room and join new page room
      socket.leave(`page:${data.from}`)
      socket.join(`page:${data.to}`)

      // Update user current page
      user.currentPage = data.to
      user.lastActivity = new Date()
      this.connectedUsers.set(userId, user)
    } catch (error) {
      console.error('❌ Error handling page change:', error)
    }
  }

  /**
   * Handle AI requests and broadcast results
   */
  private handleAIRequest(socket: any, data: {
    type: 'insight' | 'recommendation' | 'analysis'
    context: string
    parameters?: any
  }) {
    try {
      const userId = this.userSockets.get(socket.id)
      if (!userId) return

      const user = this.connectedUsers.get(userId)
      if (!user) return

      // Emit AI processing event
      socket.emit('krins:ai:processing', {
        requestId: `ai_${Date.now()}`,
        type: data.type,
        estimatedTime: 3000 // 3 seconds
      })

      // Simulate AI processing (in real implementation, this would call actual AI service)
      setTimeout(() => {
        const aiResult = {
          requestId: `ai_${Date.now()}`,
          type: data.type,
          result: this.generateMockAIResult(data.type, data.context),
          confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
          timestamp: new Date()
        }

        socket.emit('krins:ai:result', aiResult)

        // Create activity event
        this.createActivityEvent({
          type: 'ai_insight',
          user: 'KRINS AI',
          message: `Generated ${data.type} for ${user.name}`,
          data: { aiType: data.type, context: data.context },
          priority: 'medium'
        })
      }, Math.random() * 2000 + 1000) // 1-3 seconds

    } catch (error) {
      console.error('❌ Error handling AI request:', error)
      socket.emit('krins:error', { message: 'AI request failed' })
    }
  }

  /**
   * Handle insight broadcasting to team
   */
  private handleInsightBroadcast(socket: any, data: {
    insight: string
    type: 'recommendation' | 'warning' | 'opportunity'
    targetUsers?: string[]
    priority: 'low' | 'medium' | 'high' | 'critical'
  }) {
    try {
      const userId = this.userSockets.get(socket.id)
      if (!userId) return

      const user = this.connectedUsers.get(userId)
      if (!user) return

      const insight = {
        id: `insight_${Date.now()}`,
        ...data,
        author: user.name,
        timestamp: new Date()
      }

      // Broadcast to specific users or all
      if (data.targetUsers && data.targetUsers.length > 0) {
        data.targetUsers.forEach(targetId => {
          this.io.to(`user:${targetId}`).emit('krins:insight:received', insight)
        })
      } else {
        this.io.to('krins:global').emit('krins:insight:broadcast', insight)
      }

      // Create activity event
      this.createActivityEvent({
        type: 'ai_insight',
        user: user.name,
        message: `Shared ${data.type}: ${data.insight.substring(0, 50)}...`,
        priority: data.priority
      })

      console.log(`💡 Insight broadcast by ${user.name}: ${data.type}`)
    } catch (error) {
      console.error('❌ Error broadcasting insight:', error)
    }
  }

  /**
   * Handle evidence addition notifications
   */
  private handleEvidenceAdd(socket: any, data: {
    adrId: string
    evidenceType: string
    title: string
    description: string
  }) {
    try {
      const userId = this.userSockets.get(socket.id)
      if (!userId) return

      const user = this.connectedUsers.get(userId)
      if (!user) return

      // Broadcast to decision room and interested users
      this.io.to(`decision:${data.adrId}`).emit('krins:evidence:added', {
        ...data,
        author: user.name,
        timestamp: new Date()
      })

      // Create activity event
      this.createActivityEvent({
        type: 'decision_activity',
        user: user.name,
        message: `Added ${data.evidenceType} evidence to ${data.title}`,
        data: { adrId: data.adrId, evidenceType: data.evidenceType },
        priority: 'medium'
      })
    } catch (error) {
      console.error('❌ Error handling evidence add:', error)
    }
  }

  /**
   * Handle evidence updates
   */
  private handleEvidenceUpdate(socket: any, data: {
    adrId: string
    evidenceId: string
    updateType: 'modified' | 'deleted'
    title?: string
  }) {
    try {
      const userId = this.userSockets.get(socket.id)
      if (!userId) return

      const user = this.connectedUsers.get(userId)
      if (!user) return

      // Broadcast evidence update
      this.io.to(`decision:${data.adrId}`).emit('krins:evidence:updated', {
        ...data,
        author: user.name,
        timestamp: new Date()
      })
    } catch (error) {
      console.error('❌ Error handling evidence update:', error)
    }
  }

  /**
   * Handle team messages
   */
  private handleTeamMessage(socket: any, data: {
    message: string
    channel?: string
    priority?: 'low' | 'medium' | 'high'
  }) {
    try {
      const userId = this.userSockets.get(socket.id)
      if (!userId) return

      const user = this.connectedUsers.get(userId)
      if (!user) return

      const channel = data.channel || 'general'
      const teamMessage = {
        id: `msg_${Date.now()}`,
        message: data.message,
        author: user.name,
        authorId: userId,
        channel,
        priority: data.priority || 'low',
        timestamp: new Date()
      }

      // Broadcast to channel or global
      this.io.to(`channel:${channel}`).emit('krins:team:message', teamMessage)

      console.log(`💬 Team message from ${user.name} in ${channel}`)
    } catch (error) {
      console.error('❌ Error handling team message:', error)
    }
  }

  /**
   * Handle team notifications
   */
  private handleTeamNotification(socket: any, data: {
    type: 'alert' | 'info' | 'success' | 'warning'
    title: string
    message: string
    targetRoles?: string[]
    persistent?: boolean
  }) {
    try {
      const userId = this.userSockets.get(socket.id)
      if (!userId) return

      const user = this.connectedUsers.get(userId)
      if (!user) return

      const notification = {
        id: `notif_${Date.now()}`,
        ...data,
        author: user.name,
        timestamp: new Date()
      }

      // Send to specific roles or all users
      if (data.targetRoles && data.targetRoles.length > 0) {
        this.connectedUsers.forEach((connectedUser, connectedUserId) => {
          if (data.targetRoles!.includes(connectedUser.role)) {
            this.io.to(`user:${connectedUserId}`).emit('krins:team:notification', notification)
          }
        })
      } else {
        this.io.to('krins:global').emit('krins:team:notification', notification)
      }
    } catch (error) {
      console.error('❌ Error handling team notification:', error)
    }
  }

  /**
   * Handle user disconnect
   */
  private handleDisconnect(socket: any) {
    try {
      const userId = this.userSockets.get(socket.id)
      if (!userId) return

      const user = this.connectedUsers.get(userId)
      if (!user) return

      console.log(`👋 User disconnected: ${user.name} (${socket.id})`)

      // Remove from active sessions
      this.collaborationSessions.forEach((session, sessionId) => {
        if (session.participants.includes(userId)) {
          session.participants = session.participants.filter(id => id !== userId)
          if (session.participants.length === 0) {
            this.collaborationSessions.delete(sessionId)
          } else {
            this.collaborationSessions.set(sessionId, session)
          }
        }
      })

      // Clean up connection mappings
      this.connectedUsers.delete(userId)
      this.userSockets.delete(socket.id)

      // Broadcast user offline status
      this.broadcastUserPresence(userId, 'left')

      // Create activity event
      this.createActivityEvent({
        type: 'user_activity',
        user: user.name,
        message: `${user.name} left the system`,
        priority: 'low'
      })
    } catch (error) {
      console.error('❌ Error handling disconnect:', error)
    }
  }

  /**
   * Broadcast user presence changes
   */
  private broadcastUserPresence(userId: string, action: 'joined' | 'left' | 'status_changed') {
    const user = this.connectedUsers.get(userId)
    
    this.io.to('krins:global').emit('krins:user:presence', {
      userId,
      user: user || { id: userId, name: 'Unknown', status: 'offline' },
      action,
      onlineCount: this.connectedUsers.size,
      timestamp: new Date()
    })
  }

  /**
   * Create and broadcast activity events
   */
  private createActivityEvent(eventData: Partial<ActivityEvent>) {
    const activity: ActivityEvent = {
      id: `activity_${Date.now()}`,
      type: eventData.type || 'system_event',
      user: eventData.user || 'System',
      message: eventData.message || 'System activity',
      data: eventData.data,
      timestamp: new Date(),
      priority: eventData.priority || 'low'
    }

    // Add to history
    this.activityHistory.push(activity)
    if (this.activityHistory.length > this.maxActivityHistory) {
      this.activityHistory = this.activityHistory.slice(-this.maxActivityHistory)
    }

    // Broadcast to all connected users
    this.io.to('krins:global').emit('krins:activity:new', activity)

    // Emit to external systems
    this.emit('activity', activity)
  }

  /**
   * Check if activity is significant enough to log
   */
  private isSignificantActivity(action: string): boolean {
    const significantActions = [
      'created_adr', 'updated_adr', 'deleted_adr',
      'added_evidence', 'updated_evidence',
      'generated_insight', 'shared_recommendation'
    ]
    return significantActions.includes(action)
  }

  /**
   * Generate mock AI result (replace with actual AI integration)
   */
  private generateMockAIResult(type: string, context: string) {
    const results = {
      insight: [
        'Based on recent decisions, consider standardizing error handling patterns across services',
        'Database performance could be improved by implementing connection pooling',
        'API versioning strategy shows consistency gaps that may impact future maintenance'
      ],
      recommendation: [
        'Implement circuit breaker pattern for external service calls',
        'Consider migrating to microservices architecture for better scalability',
        'Add comprehensive monitoring for better system observability'
      ],
      analysis: [
        'Decision velocity has increased 23% over the last quarter',
        'Most decisions focus on backend architecture (67%) vs frontend (33%)',
        'Average confidence score is 0.82, indicating good decision quality'
      ]
    }
    
    const typeResults = results[type as keyof typeof results] || ['Analysis complete']
    return typeResults[Math.floor(Math.random() * typeResults.length)]
  }

  /**
   * Start periodic cleanup of stale sessions and data
   */
  private startPeriodicCleanup() {
    setInterval(() => {
      const now = new Date()
      const staleThreshold = 30 * 60 * 1000 // 30 minutes

      // Clean up stale collaboration sessions
      this.collaborationSessions.forEach((session, sessionId) => {
        if (now.getTime() - session.lastActivity.getTime() > staleThreshold) {
          this.collaborationSessions.delete(sessionId)
        }
      })

      // Update user status based on last activity
      this.connectedUsers.forEach((user, userId) => {
        const timeSinceActivity = now.getTime() - user.lastActivity.getTime()
        
        if (timeSinceActivity > 15 * 60 * 1000) { // 15 minutes
          user.status = 'away'
          this.connectedUsers.set(userId, user)
        } else if (timeSinceActivity > 5 * 60 * 1000) { // 5 minutes
          user.status = 'idle'
          this.connectedUsers.set(userId, user)
        }
      })

      console.log(`🧹 Cleanup: ${this.connectedUsers.size} users, ${this.collaborationSessions.size} sessions`)
    }, 5 * 60 * 1000) // Every 5 minutes
  }

  /**
   * Public API methods
   */
  
  public getConnectedUsers(): ConnectedUser[] {
    return Array.from(this.connectedUsers.values())
  }

  public getActiveCollaborations(): CollaborationSession[] {
    return Array.from(this.collaborationSessions.values())
  }

  public getActivityHistory(limit = 50): ActivityEvent[] {
    return this.activityHistory.slice(-limit)
  }

  public broadcastSystemNotification(notification: {
    type: 'maintenance' | 'update' | 'alert' | 'info'
    title: string
    message: string
    persistent?: boolean
  }) {
    this.io.to('krins:global').emit('krins:system:notification', {
      ...notification,
      id: `sys_${Date.now()}`,
      timestamp: new Date()
    })
  }

  public getUserPresence(userId: string): ConnectedUser | null {
    return this.connectedUsers.get(userId) || null
  }

  public getSystemStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      activeSessions: this.collaborationSessions.size,
      totalActivities: this.activityHistory.length,
      uptime: process.uptime(),
      timestamp: new Date()
    }
  }
}

export default KRINSWebSocketSync