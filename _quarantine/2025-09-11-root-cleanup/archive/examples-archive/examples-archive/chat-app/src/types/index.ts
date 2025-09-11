// Core Types for Chat Application

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderUsername: string;
  timestamp: Date;
  type: 'text' | 'file' | 'image';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface FileUpload {
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface ChatState {
  messages: Message[];
  users: User[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface Theme {
  mode: 'light' | 'dark';
}

// WebSocket Events
export interface SocketEvents {
  // Client -> Server
  'user:join': { userId: string; username: string };
  'message:send': { content: string; type: Message['type']; fileData?: any };
  'user:typing': { isTyping: boolean };
  
  // Server -> Client
  'message:received': Message;
  'user:joined': User;
  'user:left': { userId: string };
  'user:status': { userId: string; isOnline: boolean };
  'user:typing': { userId: string; isTyping: boolean };
  'error': { message: string; code?: string };
}