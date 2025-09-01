import { useState, useEffect, useCallback, useRef } from 'react';
import { WebSocketMessage, AIActivity, AISpecialist, AIMessage } from '../types/coordination.types';

interface UseWebSocketConnectionProps {
  url: string;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
  lastMessage: WebSocketMessage | null;
}

export const useWebSocketConnection = ({
  url,
  reconnectDelay = 3000,
  maxReconnectAttempts = 5
}: UseWebSocketConnectionProps) => {
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
    lastMessage: null
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Event callbacks
  const onActivityCallbacks = useRef<Set<(activity: AIActivity) => void>>(new Set());
  const onSpecialistUpdateCallbacks = useRef<Set<(specialist: AISpecialist) => void>>(new Set());
  const onMessageCallbacks = useRef<Set<(message: AIMessage) => void>>(new Set());

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        
        console.log('🔌 WebSocket connected to AI Team Coordination');
        setState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          reconnectAttempts: 0,
          error: null
        }));
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;

        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          setState(prev => ({ ...prev, lastMessage: message }));

          // Route messages to appropriate callbacks
          switch (message.type) {
            case 'activity':
              if (message.activity) {
                onActivityCallbacks.current.forEach(callback => callback(message.activity!));
              }
              break;
            case 'specialist_update':
              if (message.specialist) {
                onSpecialistUpdateCallbacks.current.forEach(callback => callback(message.specialist!));
              }
              break;
            case 'message':
              if (message.message) {
                onMessageCallbacks.current.forEach(callback => callback(message.message!));
              }
              break;
            case 'connection':
              console.log('✅ Connection established:', message.data);
              break;
            default:
              console.log('📨 WebSocket message:', message);
          }
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        if (!mountedRef.current) return;
        
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        
        setState(prev => ({ ...prev, isConnected: false, isConnecting: false }));

        // Attempt reconnection if not intentionally closed
        if (event.code !== 1000 && state.reconnectAttempts < maxReconnectAttempts) {
          console.log(`🔄 Attempting to reconnect... (${state.reconnectAttempts + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setState(prev => ({ ...prev, reconnectAttempts: prev.reconnectAttempts + 1 }));
            connect();
          }, reconnectDelay);
        }
      };

      ws.onerror = (error) => {
        if (!mountedRef.current) return;
        
        console.error('❌ WebSocket error:', error);
        setState(prev => ({ 
          ...prev, 
          error: 'WebSocket connection failed',
          isConnecting: false 
        }));
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to create WebSocket connection',
        isConnecting: false 
      }));
    }
  }, [url, reconnectDelay, maxReconnectAttempts, state.reconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // Subscription methods
  const onActivity = useCallback((callback: (activity: AIActivity) => void) => {
    onActivityCallbacks.current.add(callback);
    return () => onActivityCallbacks.current.delete(callback);
  }, []);

  const onSpecialistUpdate = useCallback((callback: (specialist: AISpecialist) => void) => {
    onSpecialistUpdateCallbacks.current.add(callback);
    return () => onSpecialistUpdateCallbacks.current.delete(callback);
  }, []);

  const onMessage = useCallback((callback: (message: AIMessage) => void) => {
    onMessageCallbacks.current.add(callback);
    return () => onMessageCallbacks.current.delete(callback);
  }, []);

  // Connect on mount, cleanup on unmount
  useEffect(() => {
    connect();
    
    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    sendMessage,
    onActivity,
    onSpecialistUpdate,
    onMessage
  };
};