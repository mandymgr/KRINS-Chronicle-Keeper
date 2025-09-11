import { useEffect, useRef, useCallback, useState } from 'react';
import { WebSocketEvents, BlogComment } from '../types';
import { useBlogAuth } from '../contexts/BlogAuthContext';

// WebSocket connection states
type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

interface UseWebSocketOptions {
  onCommentCreated?: (comment: BlogComment) => void;
  onCommentUpdated?: (comment: BlogComment) => void;
  onCommentDeleted?: (data: { commentId: string; postId: string }) => void;
  onCommentLiked?: (data: { commentId: string; likesCount: number }) => void;
  onUserTyping?: (data: { userId: string; username: string; postId: string; isTyping: boolean }) => void;
  onUserJoinedPost?: (data: { userId: string; username: string; postId: string }) => void;
  onUserLeftPost?: (data: { userId: string; username: string; postId: string }) => void;
  onError?: (error: { message: string; code?: string }) => void;
}

interface UseWebSocketReturn {
  connectionState: ConnectionState;
  isConnected: boolean;
  joinPost: (postId: string) => void;
  leavePost: (postId: string) => void;
  sendComment: (postId: string, content: string, parentId?: string) => void;
  startTyping: (postId: string) => void;
  stopTyping: (postId: string) => void;
  likeComment: (commentId: string) => void;
  editComment: (commentId: string, content: string) => void;
  deleteComment: (commentId: string) => void;
  disconnect: () => void;
}

// WebSocket endpoint - coordinating with Backend Specialist's WebSocket server
const WS_URL = 'ws://localhost:3000';

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const { state } = useBlogAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000;

  // Cleanup function
  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!state.token || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    setConnectionState('connecting');
    
    // Create WebSocket connection with JWT token
    const ws = new WebSocket(`${WS_URL}?token=${state.token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnectionState('connected');
      reconnectAttemptsRef.current = 0;

      // Start heartbeat to keep connection alive
      heartbeatIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      setConnectionState('disconnected');
      cleanup();

      // Auto-reconnect if not manually disconnected and we have a token
      if (event.code !== 1000 && state.token && reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current++;
        reconnectTimeoutRef.current = setTimeout(connect, reconnectDelay);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionState('error');
      options.onError?.({ message: 'WebSocket connection error' });
    };
  }, [state.token, cleanup, options]);

  // Handle incoming WebSocket messages
  const handleMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'comment-created':
        options.onCommentCreated?.(message.data);
        break;
      case 'comment-updated':
        options.onCommentUpdated?.(message.data);
        break;
      case 'comment-deleted':
        options.onCommentDeleted?.(message.data);
        break;
      case 'comment-liked':
        options.onCommentLiked?.(message.data);
        break;
      case 'user-typing':
        options.onUserTyping?.(message.data);
        break;
      case 'user-joined-post':
        options.onUserJoinedPost?.(message.data);
        break;
      case 'user-left-post':
        options.onUserLeftPost?.(message.data);
        break;
      case 'error':
        options.onError?.(message.data);
        break;
      case 'pong':
        // Heartbeat response - connection is alive
        break;
      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  }, [options]);

  // Send WebSocket message
  const sendMessage = useCallback(<K extends keyof WebSocketEvents>(
    type: K,
    data: WebSocketEvents[K]
  ) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type, data }));
    } else {
      console.warn('WebSocket not connected, cannot send message:', type);
    }
  }, []);

  // WebSocket event handlers - coordinating with Backend Specialist's WebSocket events
  const joinPost = useCallback((postId: string) => {
    sendMessage('join-post', { postId });
  }, [sendMessage]);

  const leavePost = useCallback((postId: string) => {
    sendMessage('leave-post', { postId });
  }, [sendMessage]);

  const sendComment = useCallback((postId: string, content: string, parentId?: string) => {
    sendMessage('new-comment', { postId, content, parentId });
  }, [sendMessage]);

  const startTyping = useCallback((postId: string) => {
    sendMessage('typing-start', { postId });
  }, [sendMessage]);

  const stopTyping = useCallback((postId: string) => {
    sendMessage('typing-stop', { postId });
  }, [sendMessage]);

  const likeComment = useCallback((commentId: string) => {
    sendMessage('comment-like', { commentId });
  }, [sendMessage]);

  const editComment = useCallback((commentId: string, content: string) => {
    sendMessage('comment-edit', { commentId, content });
  }, [sendMessage]);

  const deleteComment = useCallback((commentId: string) => {
    sendMessage('comment-delete', { commentId });
  }, [sendMessage]);

  const disconnect = useCallback(() => {
    cleanup();
    if (wsRef.current) {
      wsRef.current.close(1000, 'User initiated disconnect');
      wsRef.current = null;
    }
    setConnectionState('disconnected');
  }, [cleanup]);

  // Connect when component mounts and we have a token
  useEffect(() => {
    if (state.isAuthenticated && state.token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [state.isAuthenticated, state.token, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
    };
  }, [cleanup]);

  return {
    connectionState,
    isConnected: connectionState === 'connected',
    joinPost,
    leavePost,
    sendComment,
    startTyping,
    stopTyping,
    likeComment,
    editComment,
    deleteComment,
    disconnect
  };
}