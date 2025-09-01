'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface AISpecialist {
  id: string
  name: string
  role: string
  status: 'active' | 'processing' | 'inactive'
  lastActivity?: string
  currentTask?: string
}

interface ActivityLog {
  id: string
  timestamp: string
  specialist: string
  message: string
  type: 'coordination' | 'specialist_update' | 'system'
}

export default function AITeamDashboard() {
  const [specialists, setSpecialists] = useState<AISpecialist[]>([
    {
      id: 'backend',
      name: 'Backend Specialist',
      role: 'System Architecture',
      status: 'active',
      lastActivity: 'Just now',
      currentTask: 'API optimization'
    },
    {
      id: 'frontend',
      name: 'Frontend Specialist', 
      role: 'Nordic Design',
      status: 'active',
      lastActivity: '2 min ago',
      currentTask: 'Component refinement'
    },
    {
      id: 'testing',
      name: 'Testing Specialist',
      role: 'Quality Assurance',
      status: 'processing',
      lastActivity: '5 min ago',
      currentTask: 'Test suite execution'
    },
    {
      id: 'security',
      name: 'Security Specialist',
      role: 'Vulnerability Analysis',
      status: 'active',
      lastActivity: '1 min ago',
      currentTask: 'Security audit'
    },
    {
      id: 'performance',
      name: 'Performance Specialist',
      role: 'System Optimization',
      status: 'active',
      lastActivity: '30 sec ago',
      currentTask: 'Performance monitoring'
    }
  ])

  const [activityLog, setActivityLog] = useState<ActivityLog[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    let ws: WebSocket | null = null
    let reconnectTimer: NodeJS.Timeout | null = null
    
    // WebSocket connection to MCP AI Team server
    const connectToAITeam = () => {
      try {
        console.log('Attempting to connect to AI Team WebSocket...')
        ws = new WebSocket('ws://localhost:3007/ws')
        
        ws.onopen = () => {
          console.log('✅ Connected to AI Team server')
          setIsConnected(true)
          if (reconnectTimer) {
            clearTimeout(reconnectTimer)
            reconnectTimer = null
          }
        }
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log('📨 Received WebSocket data:', data)
            
            // Handle activity updates
            if (data.type === 'activity' && data.activity) {
              const activity = data.activity
              const newActivity: ActivityLog = {
                id: Date.now().toString() + Math.random(),
                timestamp: new Date().toLocaleTimeString(),
                specialist: activity.specialistName || 'System',
                message: activity.message || 'Activity update',
                type: 'specialist_update'
              }
              
              setActivityLog(prev => [newActivity, ...prev.slice(0, 19)])
              
              // Update specialist status
              setSpecialists(prev => prev.map(specialist => {
                const specialistName = activity.specialistName?.toLowerCase() || ''
                const specialistMatch = specialistName.includes('backend') ? 'backend' :
                                      specialistName.includes('frontend') ? 'frontend' :
                                      specialistName.includes('testing') ? 'testing' :
                                      specialistName.includes('security') ? 'security' :
                                      specialistName.includes('performance') ? 'performance' : null
                
                if (specialistMatch && specialist.id === specialistMatch) {
                  return {
                    ...specialist,
                    status: 'active',
                    lastActivity: 'Just now',
                    currentTask: activity.message?.substring(0, 60) + '...' || 'Working'
                  }
                }
                return specialist
              }))
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error, event.data)
          }
        }
        
        ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error)
          setIsConnected(false)
        }
        
        ws.onclose = (event) => {
          console.log('🔌 WebSocket connection closed:', event.code, event.reason)
          setIsConnected(false)
          
          // Reconnect after 2 seconds if not manually closed
          if (event.code !== 1000) {
            reconnectTimer = setTimeout(() => {
              console.log('🔄 Attempting to reconnect...')
              connectToAITeam()
            }, 2000)
          }
        }
        
      } catch (error) {
        console.error('❌ Failed to connect to AI Team:', error)
        setIsConnected(false)
        reconnectTimer = setTimeout(connectToAITeam, 2000)
      }
    }

    connectToAITeam()
    
    return () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
      }
      if (ws) {
        ws.close(1000, 'Component unmounting')
      }
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'var(--ai-agent-active)'
      case 'processing': return 'var(--ai-agent-processing)' 
      case 'inactive': return 'var(--ai-agent-inactive)'
      default: return 'var(--stone-500)'
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--dashboard-bg)',
      fontFamily: 'var(--font-sans)',
      color: 'var(--ink)',
      lineHeight: '1.4'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'var(--paper)',
        padding: '30px 0',
        borderBottom: '1px solid var(--stone-200)'
      }}>
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{
                fontSize: '24px',
                fontFamily: 'var(--font-serif)',
                fontWeight: '400',
                marginBottom: '5px',
                color: 'var(--ink)'
              }}>
                AI Team Dashboard
              </h1>
              <p style={{
                fontSize: '14px',
                color: 'var(--stone-500)',
                margin: '0'
              }}>
                Real-time coordination and monitoring
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: 'var(--stone-500)'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isConnected ? 'var(--ai-agent-active)' : 'var(--ai-agent-inactive)'
                }} />
                {isConnected ? 'Connected' : 'Connecting...'}
              </div>
              
              <Link href="/" style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: 'var(--ink)',
                border: '1px solid var(--stone-200)',
                fontSize: '14px',
                textDecoration: 'none',
                borderRadius: '4px',
                transition: 'all 0.2s ease'
              }}>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        
        {/* Team Overview */}
        <div style={{
          marginBottom: '60px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontFamily: 'var(--font-serif)',
            fontWeight: '400',
            marginBottom: '30px',
            color: 'var(--ink)',
            textAlign: 'center'
          }}>
            Active Specialists
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {specialists.map((specialist) => (
              <div key={specialist.id} style={{
                backgroundColor: 'var(--paper)',
                padding: '24px',
                borderRadius: '8px',
                border: '1px solid var(--stone-200)',
                transition: 'all 0.2s ease'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: '0',
                    color: 'var(--ink)'
                  }}>
                    {specialist.name}
                  </h3>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: getStatusColor(specialist.status)
                  }} />
                </div>
                
                <p style={{
                  fontSize: '14px',
                  color: 'var(--stone-500)',
                  margin: '0 0 8px',
                  fontWeight: '500'
                }}>
                  {specialist.role}
                </p>
                
                {specialist.currentTask && (
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--stone-500)',
                    margin: '0 0 8px',
                    fontStyle: 'italic'
                  }}>
                    {specialist.currentTask}
                  </p>
                )}
                
                <p style={{
                  fontSize: '12px',
                  color: 'var(--stone-500)',
                  margin: '0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {specialist.lastActivity}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <h2 style={{
            fontSize: '18px',
            fontFamily: 'var(--font-serif)',
            fontWeight: '400',
            marginBottom: '30px',
            color: 'var(--ink)',
            textAlign: 'center'
          }}>
            Live Activity Feed
          </h2>
          
          <div style={{
            backgroundColor: 'var(--paper)',
            borderRadius: '8px',
            border: '1px solid var(--stone-200)',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {activityLog.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: 'var(--stone-500)'
              }}>
                <p style={{ margin: '0', fontSize: '14px' }}>
                  Waiting for AI team activity...
                </p>
              </div>
            ) : (
              activityLog.map((log) => (
                <div key={log.id} style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid var(--stone-100)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      margin: '0 0 4px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'var(--ink)'
                    }}>
                      {log.specialist}
                    </p>
                    <p style={{
                      margin: '0',
                      fontSize: '13px',
                      color: 'var(--stone-500)',
                      lineHeight: '1.4'
                    }}>
                      {log.message}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    color: 'var(--stone-500)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginLeft: '16px',
                    whiteSpace: 'nowrap'
                  }}>
                    {log.timestamp}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}