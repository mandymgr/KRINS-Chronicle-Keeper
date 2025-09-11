import React, { useState } from 'react';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { LoginCredentials, FormErrors } from '../../../types';
import { Button } from '../../ui/Button';

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Form validation
function validateLoginForm(credentials: LoginCredentials): FormErrors {
  const errors: FormErrors = {};

  if (!credentials.email.trim()) {
    errors.email = 'Email is required';
  } else if (!emailRegex.test(credentials.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!credentials.password) {
    errors.password = 'Password is required';
  } else if (credentials.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return errors;
}

export function LoginForm({ onSubmit, isLoading, error, className = '' }: LoginFormProps) {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateLoginForm(credentials);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await onSubmit(credentials);
    } catch (err) {
      // Error handling is done in parent component
      console.error('Login failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Sign In to DevBlog
        </h2>
        <p className="text-center text-gray-600">
          Access your account to create and manage blog posts
        </p>
      </div>

      {/* Global error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Email field */}
      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={credentials.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
            ${fieldErrors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
          `}
          placeholder="Enter your email"
          disabled={isLoading}
          autoComplete="email"
        />
        {fieldErrors.email && (
          <p className="text-sm text-red-600">{fieldErrors.email}</p>
        )}
      </div>

      {/* Password field */}
      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={credentials.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={`
              w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
              ${fieldErrors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
            `}
            placeholder="Enter your password"
            disabled={isLoading}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
        {fieldErrors.password && (
          <p className="text-sm text-red-600">{fieldErrors.password}</p>
        )}
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Signing In...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <LogIn className="h-4 w-4" />
            <span>Sign In</span>
          </div>
        )}
      </Button>

      {/* Demo credentials hint */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700">
          <strong>Demo Credentials:</strong><br />
          Email: demo@devblog.com<br />
          Password: demo123
        </p>
      </div>
    </form>
  );
}