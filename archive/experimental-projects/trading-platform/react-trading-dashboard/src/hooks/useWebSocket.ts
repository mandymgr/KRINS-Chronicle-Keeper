import { useState, useCallback, useRef, useEffect } from 'react'

interface UseWebSocketOptions {
  url: string
  onConnect?: () => void
  onDisconnect?: () => void
  onMessage?: (data: any) => void
  onError?: (error: Error) => void
  reconnectInterval?: number
}

export const useWebSocket = (options: UseWebSocketOptions) => {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected')
  const [latency, setLatency] = useState(0)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastPingTime = useRef(0)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    try {
      setConnectionStatus('connecting')
      wsRef.current = new WebSocket(options.url)

      wsRef.current.onopen = () => {
        setConnectionStatus('connected')
        options.onConnect?.()
        
        // Start ping interval for latency measurement
        pingIntervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            lastPingTime.current = performance.now()
            wsRef.current.send(JSON.stringify({ type: 'ping', timestamp: lastPingTime.current }))
          }
        }, 5000)
      }

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          // Handle pong for latency calculation
          if (data.type === 'pong') {
            setLatency(performance.now() - lastPingTime.current)
            return
          }
          
          options.onMessage?.(data)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      wsRef.current.onclose = () => {
        setConnectionStatus('disconnected')
        options.onDisconnect?.()
        
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current)
        }
        
        // Auto-reconnect
        if (options.reconnectInterval !== 0) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, options.reconnectInterval || 3000)
        }
      }

      wsRef.current.onerror = (error) => {
        options.onError?.(new Error('WebSocket connection error'))
      }
    } catch (error) {
      setConnectionStatus('disconnected')
      options.onError?.(error as Error)
    }
  }, [options])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
    }
    
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    setConnectionStatus('disconnected')
  }, [])

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
      return true
    }
    return false
  }, [])

  const subscribe = useCallback((symbols: string[]) => {
    return sendMessage({
      action: 'subscribe',
      symbols
    })
  }, [sendMessage])

  const unsubscribe = useCallback((symbols: string[]) => {
    return sendMessage({
      action: 'unsubscribe', 
      symbols
    })
  }, [sendMessage])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  return {
    connect,
    disconnect,
    sendMessage,
    subscribe,
    unsubscribe,
    connectionStatus,
    latency
  }
}