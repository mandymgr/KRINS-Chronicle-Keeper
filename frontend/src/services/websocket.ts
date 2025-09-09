/**
 * 🔗 KRINS WebSocket Client
 * 
 * Real-time synchronization client for organizational intelligence
 * Manages connection, authentication, and event handling
 * 
 * @author KRINS Intelligence System
 */

import { io, Socket } from 'socket.io-client'
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

interface ActivityEvent {
  id: string
  type: 'decision_activity' | 'user_activity' | 'ai_insight' | 'system_event'
  user: string
  message: string
  data?: any
  timestamp: Date
  priority: 'low' | 'medium' | 'high' | 'critical'
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
  updatedBy?: ConnectedUser
}

interface SystemNotification {
  id: string
  type: 'maintenance' | 'update' | 'alert' | 'info'
  title: string
  message: string
  persistent?: boolean
  timestamp: Date
}

interface CollaborationEvent {
  userId: string
  user: ConnectedUser
  adrId: string
  action: 'cursor_move' | 'text_select' | 'edit_start' | 'edit_end'
  position?: { line: number, column: number }
  selection?: { start: number, end: number }
  content?: string
  timestamp: Date
}

interface AIResult {
  requestId: string
  type: 'insight' | 'recommendation' | 'analysis'
  result: string
  confidence: number
  timestamp: Date
}

export class KRINSWebSocketClient extends EventEmitter {
  private socket: Socket | null = null
  private connectionAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isAuthenticated = false
  private heartbeatInterval: NodeJS.Timeout | null = null
  private currentUser: ConnectedUser | null = null

  constructor(private serverUrl: string = 'ws://localhost:3001') {
    super()
    this.setupEventHandlers()
  }

  /**
   * Connect to KRINS WebSocket server
   */
  public connect(user: {
    userId: string
    name: string
    role: string
    avatar?: string
    currentPage: string
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.connected) {
        resolve()
        return
      }

      console.log('🔗 Connecting to KRINS WebSocket server...')

      this.socket = io(this.serverUrl, {
        path: '/krins-socket',
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay
      })

      this.socket.on('connect', () => {
        console.log('✅ Connected to KRINS WebSocket server')
        this.connectionAttempts = 0
        
        // Authenticate with server
        this.authenticate(user)
          .then(() => resolve())
          .catch(reject)
      })

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error)
        this.connectionAttempts++
        
        if (this.connectionAttempts >= this.maxReconnectAttempts) {
          reject(new Error(`Failed to connect after ${this.maxReconnectAttempts} attempts`))
        }
      })

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from KRINS WebSocket server:', reason)
        this.isAuthenticated = false
        this.stopHeartbeat()
        this.emit('disconnected', reason)
      })

      this.setupSocketEventHandlers()
    })
  }

  /**
   * Authenticate with the server
   */
  private async authenticate(user: {
    userId: string
    name: string
    role: string
    avatar?: string
    currentPage: string
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'))
        return
      }

      this.socket.emit('krins:auth', user)

      this.socket.once('krins:auth:success', (data) => {
        console.log('✅ Authenticated successfully')
        this.isAuthenticated = true
        this.currentUser = data.user
        this.startHeartbeat()
        this.emit('authenticated', data)
        resolve()
      })

      this.socket.once('krins:error', (error) => {
        console.error('❌ Authentication failed:', error)
        reject(new Error(error.message))
      })

      // Timeout authentication
      setTimeout(() => {
        if (!this.isAuthenticated) {
          reject(new Error('Authentication timeout'))
        }
      }, 10000)
    })
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupSocketEventHandlers() {
    if (!this.socket) return

    // User presence events
    this.socket.on('krins:user:presence', (data) => {
      this.emit('userPresence', data)
    })

    // Activity events
    this.socket.on('krins:activity:new', (activity: ActivityEvent) => {
      this.emit('activity', activity)
    })

    // Decision events
    this.socket.on('krins:decision:updated', (update: DecisionUpdate) => {
      this.emit('decisionUpdated', update)
    })

    this.socket.on('krins:decision:notification', (notification) => {
      this.emit('decisionNotification', notification)
    })

    this.socket.on('krins:decision:joined', (data) => {
      this.emit('decisionJoined', data)
    })

    this.socket.on('krins:decision:participant:joined', (data) => {
      this.emit('participantJoined', data)
    })

    this.socket.on('krins:decision:participant:left', (data) => {
      this.emit('participantLeft', data)
    })

    this.socket.on('krins:decision:collaboration', (event: CollaborationEvent) => {
      this.emit('collaboration', event)
    })

    // Evidence events
    this.socket.on('krins:evidence:added', (data) => {
      this.emit('evidenceAdded', data)
    })

    this.socket.on('krins:evidence:updated', (data) => {
      this.emit('evidenceUpdated', data)
    })

    // AI events
    this.socket.on('krins:ai:processing', (data) => {
      this.emit('aiProcessing', data)
    })

    this.socket.on('krins:ai:result', (result: AIResult) => {
      this.emit('aiResult', result)
    })

    this.socket.on('krins:insight:received', (insight) => {
      this.emit('insightReceived', insight)
    })

    this.socket.on('krins:insight:broadcast', (insight) => {
      this.emit('insightBroadcast', insight)
    })

    // Team collaboration events
    this.socket.on('krins:team:message', (message) => {
      this.emit('teamMessage', message)
    })

    this.socket.on('krins:team:notification', (notification) => {
      this.emit('teamNotification', notification)
    })

    // System events
    this.socket.on('krins:system:notification', (notification: SystemNotification) => {
      this.emit('systemNotification', notification)
    })

    this.socket.on('krins:heartbeat:ack', () => {
      // Heartbeat acknowledged
    })

    this.socket.on('krins:error', (error) => {
      console.error('❌ WebSocket error:', error)
      this.emit('error', error)
    })
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.socket.connected) {
        this.socket.emit('krins:heartbeat')
      }
    }, 30000) // Every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  /**
   * Setup internal event handlers
   */
  private setupEventHandlers() {
    // Handle page visibility changes
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (this.isAuthenticated) {
          this.updatePresence(document.hidden ? 'idle' : 'active')
        }
      })
    }

    // Handle before unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.disconnect()
      })
    }
  }

  /**
   * Public API methods
   */

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.isAuthenticated = false
    this.stopHeartbeat()
  }

  public updatePresence(status: 'active' | 'idle' | 'away') {
    if (this.socket && this.isAuthenticated) {
      this.socket.emit('krins:presence:update', { status })
    }
  }

  public changePage(from: string, to: string) {
    if (this.socket && this.isAuthenticated) {
      this.socket.emit('krins:page:change', { from, to })
    }
  }

  public joinDecision(adrId: string, sessionType: 'editing' | 'reviewing' | 'discussion' = 'reviewing') {
    if (this.socket && this.isAuthenticated) {
      this.socket.emit('krins:decision:join', { adrId, sessionType })
    }
  }

  public leaveDecision(adrId: string, sessionType: 'editing' | 'reviewing' | 'discussion' = 'reviewing') {
    if (this.socket && this.isAuthenticated) {
      this.socket.emit('krins:decision:leave', { adrId, sessionType })
    }
  }

  public updateDecision(update: Omit<DecisionUpdate, 'id' | 'timestamp' | 'author'>) {
    if (this.socket && this.isAuthenticated) {
      this.socket.emit('krins:decision:update', {
        ...update,
        timestamp: new Date()
      })
    }
  }

  public sendCollaborationEvent(data: {
    adrId: string
    action: 'cursor_move' | 'text_select' | 'edit_start' | 'edit_end'
    position?: { line: number, column: number }
    selection?: { start: number, end: number }
    content?: string
  }) {
    if (this.socket && this.isAuthenticated) {
      this.socket.emit('krins:decision:collaborate', data)
    }
  }

  public updateActivity(action: string, target?: string, metadata?: any) {
    if (this.socket && this.isAuthenticated) {
      this.socket.emit('krins:activity:update', {
        action,
        target,
        metadata
      })
    }
  }

  public requestAI(type: 'insight' | 'recommendation' | 'analysis', context: string, parameters?: any) {
    if (this.socket && this.isAuthenticated) {
      this.socket.emit('krins:ai:request', {
        type,
        context,
        parameters
      })
    }
  }

  public broadcastInsight(data: {
    insight: string
    type: 'recommendation' | 'warning' | 'opportunity'
    targetUsers?: string[]
    priority: 'low' | 'medium' | 'high' | 'critical'
  }) {
    if (this.socket && this.isAuthenticated) {
      this.socket.emit('krins:insight:broadcast', data)
    }
  }

  public addEvidence(data: {
    adrId: string
    evidenceType: string
    title: string
    description: string
  }) {
    if (this.socket && this.isAuthenticated) {
      this.socket.emit('krins:evidence:add', data)
    }
  }

  public updateEvidence(data: {
    adrId: string
    evidenceId: string
    updateType: 'modified' | 'deleted'
    title?: string
  }) {
    if (this.socket && this.isAuthenticated) {
      this.socket.emit('krins:evidence:update', data)
    }
  }

  public sendTeamMessage(message: string, channel?: string, priority?: 'low' | 'medium' | 'high') {
    if (this.socket && this.isAuthenticated) {
      this.socket.emit('krins:team:message', {
        message,
        channel,
        priority
      })
    }
  }

  public sendTeamNotification(data: {
    type: 'alert' | 'info' | 'success' | 'warning'
    title: string
    message: string
    targetRoles?: string[]
    persistent?: boolean
  }) {
    if (this.socket && this.isAuthenticated) {
      this.socket.emit('krins:team:notification', data)
    }
  }

  public isConnected(): boolean {
    return this.socket?.connected || false
  }

  public isAuth(): boolean {
    return this.isAuthenticated
  }

  public getCurrentUser(): ConnectedUser | null {
    return this.currentUser
  }

  public getConnectionStats() {
    return {
      connected: this.isConnected(),
      authenticated: this.isAuthenticated,
      connectionAttempts: this.connectionAttempts,
      currentUser: this.currentUser
    }
  }
}

// Create singleton instance
export const websocketClient = new KRINSWebSocketClient(
  import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001'
)

export default websocketClient