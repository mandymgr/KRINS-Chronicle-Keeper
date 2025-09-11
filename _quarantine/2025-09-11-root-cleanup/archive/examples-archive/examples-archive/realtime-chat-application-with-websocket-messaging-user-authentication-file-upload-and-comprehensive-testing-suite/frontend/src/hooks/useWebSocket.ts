import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export interface UseWebSocketOptions {
  url: string;
  token?: string;
  autoConnect?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

export interface WebSocketState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempt: number;
}

export interface UseWebSocketReturn extends WebSocketState {
  socket: Socket | null;
  connect: () => void;
  disconnect: () => void;
  emit: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback?: (data: any) => void) => void;
}

export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const {
    url,
    token,
    autoConnect = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempt: 0,
  });

  const updateState = useCallback((updates: Partial<WebSocketState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    updateState({ isConnecting: true, error: null });

    const socketOptions = {
      auth: token ? { token } : undefined,
      reconnectionAttempts,
      reconnectionDelay,
    };

    const socket = io(url, socketOptions);
    socketRef.current = socket;

    socket.on('connect', () => {
      updateState({
        isConnected: true,
        isConnecting: false,
        error: null,
        reconnectAttempt: 0,
      });
    });

    socket.on('disconnect', (reason) => {
      updateState({
        isConnected: false,
        isConnecting: false,
        error: `Disconnected: ${reason}`,
      });
    });

    socket.on('connect_error', (error) => {
      updateState({
        isConnected: false,
        isConnecting: false,
        error: `Connection failed: ${error.message}`,
      });
    });

    socket.on('reconnect', (attemptNumber) => {
      updateState({
        isConnected: true,
        isConnecting: false,
        error: null,
        reconnectAttempt: 0,
      });
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      updateState({
        isConnecting: true,
        reconnectAttempt: attemptNumber,
      });
    });

    socket.on('reconnect_error', (error) => {
      updateState({
        error: `Reconnection failed: ${error.message}`,
      });
    });

    socket.on('reconnect_failed', () => {
      updateState({
        isConnecting: false,
        error: 'Reconnection failed after maximum attempts',
      });
    });
  }, [url, token, reconnectionAttempts, reconnectionDelay, updateState]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    updateState({
      isConnected: false,
      isConnecting: false,
      error: null,
      reconnectAttempt: 0,
    });
  }, [updateState]);

  const emit = useCallback((event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn(`Cannot emit event '${event}': Socket not connected`);
    }
  }, []);

  const on = useCallback((event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      if (callback) {
        socketRef.current.off(event, callback);
      } else {
        socketRef.current.off(event);
      }
    }
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Reconnect when token changes
  useEffect(() => {
    if (socketRef.current?.connected && token) {
      // Update auth token
      socketRef.current.auth = { token };
      socketRef.current.disconnect();
      connect();
    }
  }, [token, connect]);

  return {
    ...state,
    socket: socketRef.current,
    connect,
    disconnect,
    emit,
    on,
    off,
  };
}