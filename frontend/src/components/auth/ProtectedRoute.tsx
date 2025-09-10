/**
 * 🛡️ KRINS Protected Route Component
 * 
 * Route protection with role-based access control
 * Ensures only authorized users can access sensitive organizational data
 * 
 * @author KRINS Intelligence System
 */

import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Card } from '@/design-system/components/Card'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: string | string[]
  requiredPermission?: string | string[]
  fallbackPath?: string
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  fallbackPath = '/login'
}: ProtectedRouteProps) {
  const { state, hasRole, hasPermission } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!state.isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />
  }

  // Check role-based access
  if (requiredRole && !hasRole(requiredRole)) {
    return <AccessDenied reason="insufficient-role" requiredRole={requiredRole} userRole={state.user?.role} />
  }

  // Check permission-based access
  if (requiredPermission) {
    const permissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission]
    const hasRequiredPermission = permissions.some(permission => hasPermission(permission))
    
    console.log('🔐 Hub Permission Check:', {
      requiredPermission,
      userPermissions: state.user?.permissions,
      hasRequiredPermission,
      location: location.pathname
    })
    
    if (!hasRequiredPermission) {
      console.log('❌ Hub Access Denied - Missing Permission')
      return <AccessDenied reason="insufficient-permission" requiredPermission={requiredPermission} />
    }
  }

  // User has access, render the protected content
  return <>{children}</>
}

interface AccessDeniedProps {
  reason: 'insufficient-role' | 'insufficient-permission'
  requiredRole?: string | string[]
  requiredPermission?: string | string[]
  userRole?: string
}

function AccessDenied({ reason, requiredRole, requiredPermission }: AccessDeniedProps) {
  const { state, logout } = useAuth()
  
  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      admin: 'System Administrator',
      architect: 'Solution Architect',
      developer: 'Developer',
      viewer: 'Stakeholder/Viewer'
    }
    return roleNames[role as keyof typeof roleNames] || role
  }

  const getPermissionDisplayName = (permission: string) => {
    const permissionNames = {
      'system:manage': 'System Management',
      'users:manage': 'User Management',
      'adrs:create': 'Create ADRs',
      'adrs:edit': 'Edit ADRs',
      'adrs:delete': 'Delete ADRs',
      'adrs:view': 'View ADRs',
      'analytics:view': 'View Analytics',
      'intelligence:view': 'View Intelligence Dashboard',
      'settings:manage': 'Manage Settings',
      'hub:access': 'Developer Hub Access'
    }
    return permissionNames[permission as keyof typeof permissionNames] || permission
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-red-600" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Access Denied
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              You don't have permission to access this area
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-center space-x-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Authorization Required</span>
            </div>

            <div className="text-sm text-red-600 dark:text-red-400 space-y-2">
              <div className="flex justify-between">
                <span>Your Role:</span>
                <span className="font-medium">
                  {state.user?.role ? getRoleDisplayName(state.user.role) : 'Unknown'}
                </span>
              </div>

              {reason === 'insufficient-role' && requiredRole && (
                <div className="flex justify-between">
                  <span>Required Role:</span>
                  <span className="font-medium">
                    {Array.isArray(requiredRole) 
                      ? requiredRole.map(getRoleDisplayName).join(' or ')
                      : getRoleDisplayName(requiredRole)
                    }
                  </span>
                </div>
              )}

              {reason === 'insufficient-permission' && requiredPermission && (
                <div className="space-y-1">
                  <span>Required Permission{Array.isArray(requiredPermission) && requiredPermission.length > 1 ? 's' : ''}:</span>
                  <div className="font-medium">
                    {Array.isArray(requiredPermission)
                      ? requiredPermission.map(getPermissionDisplayName).join(', ')
                      : getPermissionDisplayName(requiredPermission)
                    }
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.history.back()}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Go Back
            </motion.button>

            <button
              onClick={logout}
              className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium py-2 transition-colors"
            >
              Sign Out & Switch Account
            </button>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>KRINS Security Policy Enforced</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}

/**
 * Higher-order component for protecting routes with specific roles
 */
export function withRoleProtection(requiredRole: string | string[]) {
  return function ProtectedComponent({ children }: { children: ReactNode }) {
    return (
      <ProtectedRoute requiredRole={requiredRole}>
        {children}
      </ProtectedRoute>
    )
  }
}

/**
 * Higher-order component for protecting routes with specific permissions
 */
export function withPermissionProtection(requiredPermission: string | string[]) {
  return function ProtectedComponent({ children }: { children: ReactNode }) {
    return (
      <ProtectedRoute requiredPermission={requiredPermission}>
        {children}
      </ProtectedRoute>
    )
  }
}

/**
 * Hook to check if user can access a specific route
 */
export function useRouteAccess(requiredRole?: string | string[], requiredPermission?: string | string[]) {
  const { state, hasRole, hasPermission } = useAuth()

  if (!state.isAuthenticated) {
    return { canAccess: false, reason: 'not-authenticated' }
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return { canAccess: false, reason: 'insufficient-role' }
  }

  if (requiredPermission) {
    const permissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission]
    const hasRequiredPermission = permissions.some(permission => hasPermission(permission))
    
    if (!hasRequiredPermission) {
      return { canAccess: false, reason: 'insufficient-permission' }
    }
  }

  return { canAccess: true, reason: null }
}