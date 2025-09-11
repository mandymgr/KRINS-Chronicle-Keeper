/**
 * 🔐 Blog Auth Context
 * Authentication context specifically for blog functionality
 */

import React, { createContext, useContext, useState } from 'react';
import { AuthState, AuthUser, LoginCredentials, RegisterCredentials } from '@/types';

interface BlogAuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
}

const BlogAuthContext = createContext<BlogAuthContextType | undefined>(undefined);

export const useBlogAuth = () => {
  const context = useContext(BlogAuthContext);
  if (context === undefined) {
    throw new Error('useBlogAuth must be used within a BlogAuthProvider');
  }
  return context;
};

interface BlogAuthProviderProps {
  children: React.ReactNode;
}

export const BlogAuthProvider: React.FC<BlogAuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  const login = async (credentials: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      // Simulate login API call
      const mockUser: AuthUser = {
        id: 1,
        email: credentials.email,
        name: 'Blog User',
        role: 'user',
        created_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      };

      setAuthState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      // Simulate register API call
      const mockUser: AuthUser = {
        id: 1,
        email: credentials.email,
        name: credentials.name,
        role: 'user',
        created_at: new Date().toISOString(),
      };

      setAuthState({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      }));
    }
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const value: BlogAuthContextType = {
    ...authState,
    login,
    register,
    logout,
  };

  return (
    <BlogAuthContext.Provider value={value}>
      {children}
    </BlogAuthContext.Provider>
  );
};