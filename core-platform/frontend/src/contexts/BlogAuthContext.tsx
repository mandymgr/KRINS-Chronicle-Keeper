import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { BlogAuthState, BlogUser, LoginCredentials, RegisterCredentials, AuthResponse } from '../types';

// Action types for auth reducer
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: BlogUser; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_SESSION'; payload: { user: BlogUser; token: string } };

// Initial state
const initialState: BlogAuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};

// Auth reducer - coordinating with Backend Specialist's JWT strategy
function authReducer(state: BlogAuthState, action: AuthAction): BlogAuthState {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true };
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    
    case 'RESTORE_SESSION':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    
    default:
      return state;
  }
}

// Context types
interface BlogAuthContextType {
  state: BlogAuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  getCurrentUser: () => Promise<void>;
}

const BlogAuthContext = createContext<BlogAuthContextType | undefined>(undefined);

// API client - coordinating with Backend Specialist's endpoints
const API_BASE_URL = 'http://localhost:3000/api'; // Backend Specialist's API

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('blog_token');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }
  
  return data;
}

// Auth provider component
interface BlogAuthProviderProps {
  children: ReactNode;
}

export function BlogAuthProvider({ children }: BlogAuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session on app start
  useEffect(() => {
    const restoreSession = () => {
      const token = localStorage.getItem('blog_token');
      const userData = localStorage.getItem('blog_user');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData) as BlogUser;
          dispatch({ type: 'RESTORE_SESSION', payload: { user, token } });
        } catch (error) {
          // Clear invalid data
          localStorage.removeItem('blog_token');
          localStorage.removeItem('blog_user');
        }
      }
    };

    restoreSession();
  }, []);

  // Login function - coordinating with Backend Specialist's /api/auth/login
  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await apiCall<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Store in localStorage for persistence
        localStorage.setItem('blog_token', token);
        localStorage.setItem('blog_user', JSON.stringify(user));
        
        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error instanceof Error ? error.message : 'Login failed' });
      throw error;
    }
  };

  // Register function - coordinating with Backend Specialist's /api/auth/register
  const register = async (credentials: RegisterCredentials) => {
    dispatch({ type: 'AUTH_START' });
    
    try {
      const response = await apiCall<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.success && response.data) {
        const { user, token } = response.data;
        
        // Store in localStorage for persistence
        localStorage.setItem('blog_token', token);
        localStorage.setItem('blog_user', JSON.stringify(user));
        
        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE', payload: error instanceof Error ? error.message : 'Registration failed' });
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('blog_token');
    localStorage.removeItem('blog_user');
    dispatch({ type: 'LOGOUT' });
  };

  // Get current user - coordinating with Backend Specialist's /api/auth/me
  const getCurrentUser = async () => {
    try {
      const response = await apiCall<AuthResponse>('/auth/me');
      
      if (response.success && response.data) {
        const { user, token } = response.data;
        localStorage.setItem('blog_user', JSON.stringify(user));
        dispatch({ type: 'AUTH_SUCCESS', payload: { user, token: state.token || token } });
      }
    } catch (error) {
      // If token is invalid, logout
      logout();
    }
  };

  const contextValue: BlogAuthContextType = {
    state,
    login,
    register,
    logout,
    getCurrentUser,
  };

  return (
    <BlogAuthContext.Provider value={contextValue}>
      {children}
    </BlogAuthContext.Provider>
  );
}

// Custom hook for using auth context
export function useBlogAuth(): BlogAuthContextType {
  const context = useContext(BlogAuthContext);
  if (!context) {
    throw new Error('useBlogAuth must be used within a BlogAuthProvider');
  }
  return context;
}

// HOC for protected routes
interface WithAuthProps {
  children: ReactNode;
}

export function WithAuth({ children }: WithAuthProps) {
  const { state } = useBlogAuth();
  
  if (!state.isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}