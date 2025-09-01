import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { User, AuthState, LoginCredentials, RegisterCredentials } from '../types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    
    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };
    
    case 'AUTH_LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        error: null,
      };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Mock API functions (replace with real API calls)
const mockAPI = {
  async login(credentials: LoginCredentials): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (credentials.email === 'test@example.com' && credentials.password === 'password') {
      return {
        id: '1',
        username: 'testuser',
        email: credentials.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.email}`,
        isOnline: true,
        lastSeen: new Date(),
      };
    }
    throw new Error('Invalid email or password');
  },

  async register(credentials: RegisterCredentials): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (credentials.password !== credentials.confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    if (credentials.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      username: credentials.username,
      email: credentials.email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.email}`,
      isOnline: true,
      lastSeen: new Date(),
    };
  },
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('chat_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'AUTH_SUCCESS', payload: user });
      } catch (error) {
        localStorage.removeItem('chat_user');
      }
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const user = await mockAPI.login(credentials);
      localStorage.setItem('chat_user', JSON.stringify(user));
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: (error as Error).message });
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const user = await mockAPI.register(credentials);
      localStorage.setItem('chat_user', JSON.stringify(user));
      dispatch({ type: 'AUTH_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: (error as Error).message });
    }
  };

  const logout = () => {
    localStorage.removeItem('chat_user');
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};