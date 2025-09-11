import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { ChatState, Message, User } from '../types';

interface ChatContextType extends ChatState {
  addMessage: (message: Message) => void;
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  updateUserStatus: (userId: string, isOnline: boolean) => void;
  clearMessages: () => void;
  setConnectionStatus: (isConnected: boolean) => void;
  setError: (error: string | null) => void;
  setLoading: (isLoading: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'REMOVE_USER'; payload: string }
  | { type: 'UPDATE_USER_STATUS'; payload: { userId: string; isOnline: boolean } }
  | { type: 'SET_CONNECTION_STATUS'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean };

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      // Avoid duplicate messages
      if (state.messages.some(msg => msg.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        messages: [...state.messages, action.payload].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ),
      };

    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };

    case 'ADD_USER':
      // Avoid duplicate users
      if (state.users.some(user => user.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        users: [...state.users, action.payload],
      };

    case 'REMOVE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
      };

    case 'UPDATE_USER_STATUS':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.userId
            ? { 
                ...user, 
                isOnline: action.payload.isOnline,
                lastSeen: action.payload.isOnline ? new Date() : user.lastSeen
              }
            : user
        ),
      };

    case 'SET_CONNECTION_STATUS':
      return { ...state, isConnected: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
};

const initialState: ChatState = {
  messages: [],
  users: [],
  isConnected: false,
  isLoading: false,
  error: null,
};

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const addMessage = useCallback((message: Message) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  }, []);

  const addUser = useCallback((user: User) => {
    dispatch({ type: 'ADD_USER', payload: user });
  }, []);

  const removeUser = useCallback((userId: string) => {
    dispatch({ type: 'REMOVE_USER', payload: userId });
  }, []);

  const updateUserStatus = useCallback((userId: string, isOnline: boolean) => {
    dispatch({ type: 'UPDATE_USER_STATUS', payload: { userId, isOnline } });
  }, []);

  const clearMessages = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  }, []);

  const setConnectionStatus = useCallback((isConnected: boolean) => {
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: isConnected });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: isLoading });
  }, []);

  const value: ChatContextType = {
    ...state,
    addMessage,
    addUser,
    removeUser,
    updateUserStatus,
    clearMessages,
    setConnectionStatus,
    setError,
    setLoading,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};