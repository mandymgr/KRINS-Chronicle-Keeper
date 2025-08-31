import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Mock API functions - would be replaced with real API calls
  const mockLogin = async (email: string, password: string): Promise<User> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'test@example.com' && password === 'password123') {
      return {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
        avatar: 'https://example.com/avatar.jpg',
      };
    }
    
    throw new Error('Invalid credentials');
  };

  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const user = await mockLogin(email, password);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      
      // Store token in localStorage (in real app, use httpOnly cookies)
      localStorage.setItem('authToken', 'mock-jwt-token');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('authToken');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // In real app, validate token with API
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          id: '1',
          email: 'test@example.com',
          username: 'testuser',
        },
      });
    }
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}