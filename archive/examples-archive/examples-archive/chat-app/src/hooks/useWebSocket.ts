import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { SocketEvents, Message, User } from '../types';

interface UseWebSocketProps {
  url: string;
  userId?: string;
  username?: string;
  onMessage?: (message: Message) => void;
  onUserJoined?: (user: User) => void;
  onUserLeft?: (userId: string) => void;
  onUserStatusChange?: (userId: string, isOnline: boolean) => void;
  onError?: (error: string) => void;
}

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (content: string, type?: Message['type'], fileData?: any) => void;
  setTyping: (isTyping: boolean) => void;
  disconnect: () => void;
  reconnect: () => void;
}

export const useWebSocket = ({
  url,
  userId,
  username,
  onMessage,
  onUserJoined,
  onUserLeft,
  onUserStatusChange,
  onError,
}: UseWebSocketProps): UseWebSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    try {
      const socket = io(url, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: false, // Handle reconnection manually
      });

      socketRef.current = socket;

      // Connection events
      socket.on('connect', () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
        
        if (userId && username) {
          socket.emit('user:join', { userId, username });
        }
      });

      socket.on('disconnect', (reason) => {
        setIsConnected(false);
        
        // Auto-reconnect for certain disconnect reasons
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, don't reconnect
          return;
        }
        
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          onError?.('Connection lost. Please refresh the page.');
        }
      });

      socket.on('connect_error', (error) => {
        setIsConnected(false);
        onError?.(`Connection error: ${error.message}`);
      });

      // Chat events
      socket.on('message:received', (message: Message) => {
        onMessage?.(message);
      });

      socket.on('user:joined', (user: User) => {
        onUserJoined?.(user);
      });

      socket.on('user:left', ({ userId: leftUserId }) => {
        onUserLeft?.(leftUserId);
      });

      socket.on('user:status', ({ userId: statusUserId, isOnline }) => {
        onUserStatusChange?.(statusUserId, isOnline);
      });

      socket.on('error', ({ message }) => {
        onError?.(message);
      });

    } catch (error) {
      onError?.(`Failed to connect: ${(error as Error).message}`);
    }
  }, [url, userId, username, onMessage, onUserJoined, onUserLeft, onUserStatusChange, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttempts.current = 0;
    connect();
  }, [disconnect, connect]);

  const sendMessage = useCallback((content: string, type: Message['type'] = 'text', fileData?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('message:send', { content, type, fileData });
    } else {
      onError?.('Not connected. Message not sent.');
    }
  }, [onError]);

  const setTyping = useCallback((isTyping: boolean) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('user:typing', { isTyping });
    }
  }, []);

  // Initialize connection when user is available
  useEffect(() => {
    if (userId && username) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [userId, username, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage,
    setTyping,
    disconnect,
    reconnect,
  };
};