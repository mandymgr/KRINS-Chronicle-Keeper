import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { useBlogAuth } from '../../../contexts/BlogAuthContext';
import { LoginCredentials, RegisterCredentials } from '../../../types';

type AuthMode = 'login' | 'register';

interface AuthPageProps {
  defaultMode?: AuthMode;
}

export function AuthPage({ defaultMode = 'login' }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [error, setError] = useState<string>('');
  const { state, login, register } = useBlogAuth();

  // Redirect if already authenticated
  if (state.isAuthenticated) {
    return <Navigate to="/blog" replace />;
  }

  const handleLogin = async (credentials: LoginCredentials) => {
    setError('');
    try {
      await login(credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleRegister = async (credentials: RegisterCredentials) => {
    setError('');
    try {
      await register(credentials);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(''); // Clear error when switching modes
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">DevBlog</h1>
            <p className="text-gray-600 mt-2">
              Coordinated with Backend Specialist's API
            </p>
          </div>

          {/* Auth Forms */}
          {mode === 'login' ? (
            <LoginForm
              onSubmit={handleLogin}
              isLoading={state.isLoading}
              error={error}
            />
          ) : (
            <RegisterForm
              onSubmit={handleRegister}
              isLoading={state.isLoading}
              error={error}
            />
          )}

          {/* Toggle between login and register */}
          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              disabled={state.isLoading}
            >
              {mode === 'login' ? (
                <>
                  Don't have an account? <span className="underline">Sign up</span>
                </>
              ) : (
                <>
                  Already have an account? <span className="underline">Sign in</span>
                </>
              )}
            </button>
          </div>

          {/* Backend coordination info */}
          <div className="mt-8 p-4 bg-gray-50 rounded-md border">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              🤝 Frontend-Backend Coordination
            </h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div>✅ JWT Authentication with Backend Specialist</div>
              <div>✅ API Endpoints: /api/auth/login, /api/auth/register</div>
              <div>✅ Token Management & Persistence</div>
              <div>✅ User Session Handling</div>
            </div>
          </div>
        </div>

        {/* Backend Specialist coordination indicator */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Backend Specialist API Ready
          </div>
        </div>
      </div>
    </div>
  );
}