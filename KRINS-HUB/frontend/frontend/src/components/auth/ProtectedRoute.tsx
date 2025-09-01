import React from 'react';
import { useAdminAuth } from './AdminLogin';
import AdminLogin from './AdminLogin';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user' | 'viewer';
  requiredPermission?: string;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole = 'viewer',
  requiredPermission,
  fallback 
}: ProtectedRouteProps) {
  const { user } = useAdminAuth();

  // Not authenticated
  if (!user) {
    return fallback || <AdminLogin onSuccess={() => window.location.reload()} />;
  }

  // Check role hierarchy: admin > user > viewer
  const roleHierarchy = { admin: 3, user: 2, viewer: 1 };
  const userRoleLevel = roleHierarchy[user.role];
  const requiredRoleLevel = roleHierarchy[requiredRole];

  if (userRoleLevel < requiredRoleLevel) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8 max-w-md w-full text-center border border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Access Denied</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Your role ({user.role}) doesn't have sufficient permissions to access this resource. 
            Required role: {requiredRole}
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Check specific permission if required
  if (requiredPermission && !user.permissions.includes(requiredPermission)) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-8 max-w-md w-full text-center border border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Permission Required</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            You don't have the required permission: <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-sm">{requiredPermission}</code>
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-slate-500 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}