/**
 * 🔐 KRINS Authentication Context
 * 
 * Secure authentication system for organizational intelligence platform
 * Handles user authentication, authorization, and role-based access control
 * 
 * @author KRINS Intelligence System
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'architect' | 'developer' | 'viewer'
  department?: string
  avatar?: string
  permissions: string[]
  joinedAt: Date
  lastActivity: Date
}

export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  token: string | null
  error: string | null
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' }
  | { type: 'AUTH_UPDATE_USER'; payload: Partial<User> }

interface AuthContextType {
  state: AuthState
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: RegisterData) => Promise<void>
  clearError: () => void
  hasPermission: (permission: string) => boolean
  hasRole: (role: string | string[]) => boolean
}

interface RegisterData {
  email: string
  password: string
  name: string
  department?: string
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  token: null,
  error: null,
}

// Role-based permissions
const ROLE_PERMISSIONS = {
  admin: [
    'system:manage',
    'users:manage',
    'adrs:create',
    'adrs:edit',
    'adrs:delete',
    'adrs:view',
    'analytics:view',
    'intelligence:view',
    'settings:manage',
    'hub:access'
  ],
  architect: [
    'adrs:create',
    'adrs:edit',
    'adrs:view',
    'analytics:view',
    'intelligence:view',
    'evidence:add',
    'hub:access'
  ],
  developer: [
    'adrs:view',
    'analytics:view:limited',
    'evidence:add',
    'intelligence:view:limited',
    'hub:access'
  ],
  viewer: [
    'adrs:view:limited',
    'analytics:view:dashboard',
    'hub:access'
  ]
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      }
    case 'AUTH_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        token: null,
        error: action.payload,
      }
    case 'AUTH_LOGOUT':
      return {
        ...initialState,
      }
    case 'AUTH_CLEAR_ERROR':
      return {
        ...state,
        error: null,
      }
    case 'AUTH_UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      }
    default:
      return state
  }
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Mock authentication service
  const mockAuth = {
    login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mock user database
      const mockUsers = [
        {
          id: 'admin-001',
          email: 'admin@krins.ai',
          name: 'System Administrator',
          role: 'admin' as const,
          department: 'IT Operations'
        },
        {
          id: 'arch-001',
          email: 'architect@krins.ai',
          name: 'Chief Architect',
          role: 'architect' as const,
          department: 'Architecture'
        },
        {
          id: 'dev-001',
          email: 'developer@krins.ai',
          name: 'Senior Developer',
          role: 'developer' as const,
          department: 'Engineering'
        },
        {
          id: 'view-001',
          email: 'viewer@krins.ai',
          name: 'Stakeholder',
          role: 'viewer' as const,
          department: 'Business'
        }
      ]

      const mockUser = mockUsers.find(u => u.email === email)
      if (!mockUser || password !== 'krins2025') {
        throw new Error('Invalid credentials')
      }

      const user: User = {
        ...mockUser,
        permissions: ROLE_PERMISSIONS[mockUser.role],
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${mockUser.name}`,
        joinedAt: new Date('2024-01-01'),
        lastActivity: new Date()
      }

      const token = btoa(JSON.stringify({ userId: user.id, role: user.role, exp: Date.now() + 8 * 60 * 60 * 1000 }))

      return { user, token }
    },

    register: async (userData: RegisterData): Promise<{ user: User; token: string }> => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For demo, create new user with developer role
      const user: User = {
        id: `user-${Date.now()}`,
        email: userData.email,
        name: userData.name,
        role: 'developer',
        department: userData.department || 'General',
        permissions: ROLE_PERMISSIONS.developer,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${userData.name}`,
        joinedAt: new Date(),
        lastActivity: new Date()
      }

      const token = btoa(JSON.stringify({ userId: user.id, role: user.role, exp: Date.now() + 8 * 60 * 60 * 1000 }))

      return { user, token }
    }
  }

  // Load saved auth state on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('krins_auth_token')
    const savedUser = localStorage.getItem('krins_auth_user')

    if (savedToken && savedUser) {
      try {
        const tokenData = JSON.parse(atob(savedToken))
        if (tokenData.exp > Date.now()) {
          const user = JSON.parse(savedUser)
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, token: savedToken }
          })
        } else {
          // Token expired
          localStorage.removeItem('krins_auth_token')
          localStorage.removeItem('krins_auth_user')
        }
      } catch (error) {
        console.error('Failed to restore auth state:', error)
        localStorage.removeItem('krins_auth_token')
        localStorage.removeItem('krins_auth_user')
      }
    }
  }, [])

  const login = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' })
    try {
      const { user, token } = await mockAuth.login(email, password)
      
      // Save to localStorage
      localStorage.setItem('krins_auth_token', token)
      localStorage.setItem('krins_auth_user', JSON.stringify(user))
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      })
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Login failed'
      })
    }
  }

  const register = async (userData: RegisterData) => {
    dispatch({ type: 'AUTH_START' })
    try {
      const { user, token } = await mockAuth.register(userData)
      
      // Save to localStorage
      localStorage.setItem('krins_auth_token', token)
      localStorage.setItem('krins_auth_user', JSON.stringify(user))
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      })
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Registration failed'
      })
    }
  }

  const logout = () => {
    localStorage.removeItem('krins_auth_token')
    localStorage.removeItem('krins_auth_user')
    dispatch({ type: 'AUTH_LOGOUT' })
  }

  const clearError = () => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' })
  }

  const hasPermission = (permission: string): boolean => {
    return state.user?.permissions.includes(permission) || false
  }

  const hasRole = (role: string | string[]): boolean => {
    if (!state.user) return false
    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(state.user.role)
  }

  const value: AuthContextType = {
    state,
    login,
    logout,
    register,
    clearError,
    hasPermission,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}