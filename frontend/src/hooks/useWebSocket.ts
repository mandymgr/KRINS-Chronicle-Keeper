/**
 * 🪝 KRINS WebSocket React Hooks
 * 
 * React hooks for easy WebSocket integration in components
 * Provides real-time synchronization, presence, and collaboration features
 * 
 * @author KRINS Intelligence System
 */

import { useEffect, useState, useCallback, useRef } from 'react'
import { websocketClient } from '@/services/websocket'

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

/**
 * Main WebSocket connection hook
 */
export function useWebSocket(user?: {
  userId: string
  name: string
  role: string
  avatar?: string
  currentPage: string
}) {
  const [isConnected, setIsConnected] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [reconnectAttempt, setReconnectAttempt] = useState(0)

  useEffect(() => {
    if (!user) return

    const connect = async () => {
      try {
        setConnectionError(null)
        await websocketClient.connect(user)
        setIsConnected(true)
        setIsAuthenticated(true)
      } catch (error) {
        setConnectionError(error instanceof Error ? error.message : 'Connection failed')
        console.error('Failed to connect to WebSocket:', error)
      }
    }

    connect()

    // Event listeners
    const handleAuthenticated = (data: any) => {
      setIsAuthenticated(true)
      console.log('WebSocket authenticated:', data)
    }

    const handleDisconnected = (reason: string) => {
      setIsConnected(false)
      setIsAuthenticated(false)
      console.log('WebSocket disconnected:', reason)
      
      // Attempt reconnection
      setReconnectAttempt(prev => prev + 1)
      setTimeout(() => {
        if (!websocketClient.isConnected()) {
          connect()
        }
      }, 2000 + Math.random() * 3000) // 2-5 second delay
    }

    const handleError = (error: any) => {
      setConnectionError(error.message)
      console.error('WebSocket error:', error)
    }

    websocketClient.on('authenticated', handleAuthenticated)
    websocketClient.on('disconnected', handleDisconnected)
    websocketClient.on('error', handleError)

    return () => {
      websocketClient.off('authenticated', handleAuthenticated)
      websocketClient.off('disconnected', handleDisconnected)
      websocketClient.off('error', handleError)
    }
  }, [user])

  const disconnect = useCallback(() => {
    websocketClient.disconnect()
    setIsConnected(false)
    setIsAuthenticated(false)
  }, [])

  return {
    isConnected,
    isAuthenticated,
    connectionError,
    reconnectAttempt,
    disconnect,
    client: websocketClient
  }
}

/**
 * Hook for real-time activity feed
 */
export function useActivityFeed(limit = 50) {
  const [activities, setActivities] = useState<ActivityEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handleActivity = (activity: ActivityEvent) => {
      setActivities(prev => {
        const updated = [activity, ...prev]
        return updated.slice(0, limit)
      })
    }

    const handleAuthenticated = (data: any) => {
      if (data.recentActivity) {
        setActivities(data.recentActivity.reverse())
      }
      setIsLoading(false)
    }

    websocketClient.on('activity', handleActivity)
    websocketClient.on('authenticated', handleAuthenticated)

    // If already authenticated, we might have missed the initial data
    if (websocketClient.isAuth()) {
      setIsLoading(false)
    }

    return () => {
      websocketClient.off('activity', handleActivity)
      websocketClient.off('authenticated', handleAuthenticated)
    }
  }, [limit])

  return {
    activities,
    isLoading
  }
}

/**
 * Hook for user presence awareness
 */
export function useUserPresence() {
  const [onlineUsers, setOnlineUsers] = useState<ConnectedUser[]>([])
  const [userPresenceUpdates, setUserPresenceUpdates] = useState<any[]>([])

  useEffect(() => {
    const handleUserPresence = (data: {
      userId: string
      user: ConnectedUser
      action: 'joined' | 'left' | 'status_changed'
      onlineCount: number
      timestamp: Date
    }) => {
      setUserPresenceUpdates(prev => [data, ...prev.slice(0, 19)]) // Keep last 20 updates

      if (data.action === 'joined') {
        setOnlineUsers(prev => {
          if (!prev.find(u => u.id === data.userId)) {
            return [...prev, data.user]
          }
          return prev
        })
      } else if (data.action === 'left') {
        setOnlineUsers(prev => prev.filter(u => u.id !== data.userId))
      } else if (data.action === 'status_changed') {
        setOnlineUsers(prev => 
          prev.map(u => u.id === data.userId ? { ...u, ...data.user } : u)
        )
      }
    }

    const handleAuthenticated = (data: any) => {
      if (data.onlineUsers) {
        setOnlineUsers(data.onlineUsers)
      }
    }

    websocketClient.on('userPresence', handleUserPresence)
    websocketClient.on('authenticated', handleAuthenticated)

    return () => {
      websocketClient.off('userPresence', handleUserPresence)
      websocketClient.off('authenticated', handleAuthenticated)
    }
  }, [])

  const updatePresence = useCallback((status: 'active' | 'idle' | 'away') => {
    websocketClient.updatePresence(status)
  }, [])

  return {
    onlineUsers,
    userPresenceUpdates,
    updatePresence,
    onlineCount: onlineUsers.length
  }
}

/**
 * Hook for decision collaboration
 */
export function useDecisionCollaboration(adrId?: string) {
  const [participants, setParticipants] = useState<ConnectedUser[]>([])
  const [collaborationEvents, setCollaborationEvents] = useState<any[]>([])
  const [isJoined, setIsJoined] = useState(false)
  const currentAdrId = useRef<string | null>(null)

  const joinDecision = useCallback((id: string, sessionType: 'editing' | 'reviewing' | 'discussion' = 'reviewing') => {
    if (currentAdrId.current && currentAdrId.current !== id) {
      websocketClient.leaveDecision(currentAdrId.current, sessionType)
    }
    
    websocketClient.joinDecision(id, sessionType)
    currentAdrId.current = id
  }, [])

  const leaveDecision = useCallback((sessionType: 'editing' | 'reviewing' | 'discussion' = 'reviewing') => {
    if (currentAdrId.current) {
      websocketClient.leaveDecision(currentAdrId.current, sessionType)
      currentAdrId.current = null
      setIsJoined(false)
      setParticipants([])
    }
  }, [])

  const sendCollaborationEvent = useCallback((data: {
    action: 'cursor_move' | 'text_select' | 'edit_start' | 'edit_end'
    position?: { line: number, column: number }
    selection?: { start: number, end: number }
    content?: string
  }) => {
    if (currentAdrId.current) {
      websocketClient.sendCollaborationEvent({
        adrId: currentAdrId.current,
        ...data
      })
    }
  }, [])

  useEffect(() => {
    const handleDecisionJoined = (data: any) => {
      if (data.participants) {
        setParticipants(data.participants)
        setIsJoined(true)
      }
    }

    const handleParticipantJoined = (data: any) => {
      if (data.adrId === currentAdrId.current) {
        setParticipants(data.participants || [])
      }
    }

    const handleParticipantLeft = (data: any) => {
      if (data.adrId === currentAdrId.current) {
        setParticipants(data.participants || [])
      }
    }

    const handleCollaboration = (event: any) => {
      if (event.adrId === currentAdrId.current) {
        setCollaborationEvents(prev => [event, ...prev.slice(0, 99)]) // Keep last 100 events
      }
    }

    websocketClient.on('decisionJoined', handleDecisionJoined)
    websocketClient.on('participantJoined', handleParticipantJoined)
    websocketClient.on('participantLeft', handleParticipantLeft)
    websocketClient.on('collaboration', handleCollaboration)

    return () => {
      websocketClient.off('decisionJoined', handleDecisionJoined)
      websocketClient.off('participantJoined', handleParticipantJoined)
      websocketClient.off('participantLeft', handleParticipantLeft)
      websocketClient.off('collaboration', handleCollaboration)
    }
  }, [])

  // Auto-join decision if adrId provided
  useEffect(() => {
    if (adrId && websocketClient.isAuth()) {
      joinDecision(adrId)
    }

    return () => {
      if (adrId) {
        leaveDecision()
      }
    }
  }, [adrId, joinDecision, leaveDecision])

  return {
    participants,
    collaborationEvents,
    isJoined,
    joinDecision,
    leaveDecision,
    sendCollaborationEvent
  }
}

/**
 * Hook for decision updates
 */
export function useDecisionUpdates() {
  const [decisionUpdates, setDecisionUpdates] = useState<DecisionUpdate[]>([])
  const [notifications, setNotifications] = useState<any[]>([])

  const updateDecision = useCallback((update: Omit<DecisionUpdate, 'id' | 'timestamp' | 'author'>) => {
    websocketClient.updateDecision(update)
  }, [])

  useEffect(() => {
    const handleDecisionUpdated = (update: DecisionUpdate) => {
      setDecisionUpdates(prev => [update, ...prev.slice(0, 49)]) // Keep last 50 updates
    }

    const handleDecisionNotification = (notification: any) => {
      setNotifications(prev => [notification, ...prev.slice(0, 19)]) // Keep last 20 notifications
    }

    websocketClient.on('decisionUpdated', handleDecisionUpdated)
    websocketClient.on('decisionNotification', handleDecisionNotification)

    return () => {
      websocketClient.off('decisionUpdated', handleDecisionUpdated)
      websocketClient.off('decisionNotification', handleDecisionNotification)
    }
  }, [])

  return {
    decisionUpdates,
    notifications,
    updateDecision
  }
}

/**
 * Hook for AI integration
 */
export function useAI() {
  const [aiResults, setAiResults] = useState<any[]>([])
  const [aiProcessing, setAiProcessing] = useState<any[]>([])
  const [insights, setInsights] = useState<any[]>([])

  const requestAI = useCallback((
    type: 'insight' | 'recommendation' | 'analysis',
    context: string,
    parameters?: any
  ) => {
    websocketClient.requestAI(type, context, parameters)
  }, [])

  const broadcastInsight = useCallback((data: {
    insight: string
    type: 'recommendation' | 'warning' | 'opportunity'
    targetUsers?: string[]
    priority: 'low' | 'medium' | 'high' | 'critical'
  }) => {
    websocketClient.broadcastInsight(data)
  }, [])

  useEffect(() => {
    const handleAiProcessing = (data: any) => {
      setAiProcessing(prev => [data, ...prev.slice(0, 9)]) // Keep last 10 processing requests
    }

    const handleAiResult = (result: any) => {
      setAiResults(prev => [result, ...prev.slice(0, 49)]) // Keep last 50 results
      // Remove from processing
      setAiProcessing(prev => prev.filter(p => p.requestId !== result.requestId))
    }

    const handleInsightReceived = (insight: any) => {
      setInsights(prev => [insight, ...prev.slice(0, 19)]) // Keep last 20 insights
    }

    const handleInsightBroadcast = (insight: any) => {
      setInsights(prev => [insight, ...prev.slice(0, 19)])
    }

    websocketClient.on('aiProcessing', handleAiProcessing)
    websocketClient.on('aiResult', handleAiResult)
    websocketClient.on('insightReceived', handleInsightReceived)
    websocketClient.on('insightBroadcast', handleInsightBroadcast)

    return () => {
      websocketClient.off('aiProcessing', handleAiProcessing)
      websocketClient.off('aiResult', handleAiResult)
      websocketClient.off('insightReceived', handleInsightReceived)
      websocketClient.off('insightBroadcast', handleInsightBroadcast)
    }
  }, [])

  return {
    aiResults,
    aiProcessing,
    insights,
    requestAI,
    broadcastInsight
  }
}

/**
 * Hook for team communication
 */
export function useTeamCommunication() {
  const [messages, setMessages] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])

  const sendMessage = useCallback((message: string, channel?: string, priority?: 'low' | 'medium' | 'high') => {
    websocketClient.sendTeamMessage(message, channel, priority)
  }, [])

  const sendNotification = useCallback((data: {
    type: 'alert' | 'info' | 'success' | 'warning'
    title: string
    message: string
    targetRoles?: string[]
    persistent?: boolean
  }) => {
    websocketClient.sendTeamNotification(data)
  }, [])

  useEffect(() => {
    const handleTeamMessage = (message: any) => {
      setMessages(prev => [message, ...prev.slice(0, 99)]) // Keep last 100 messages
    }

    const handleTeamNotification = (notification: any) => {
      setNotifications(prev => [notification, ...prev.slice(0, 19)]) // Keep last 20 notifications
    }

    websocketClient.on('teamMessage', handleTeamMessage)
    websocketClient.on('teamNotification', handleTeamNotification)

    return () => {
      websocketClient.off('teamMessage', handleTeamMessage)
      websocketClient.off('teamNotification', handleTeamNotification)
    }
  }, [])

  return {
    messages,
    notifications,
    sendMessage,
    sendNotification
  }
}

/**
 * Hook for page tracking
 */
export function usePageTracking() {
  const [currentPage, setCurrentPage] = useState('')

  const changePage = useCallback((to: string) => {
    const from = currentPage
    setCurrentPage(to)
    websocketClient.changePage(from, to)
  }, [currentPage])

  // Auto-track page changes based on location
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname
      if (pathname !== currentPage) {
        changePage(pathname)
      }
    }
  }, [changePage, currentPage])

  return {
    currentPage,
    changePage
  }
}