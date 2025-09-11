import React, { useState } from 'react';
import { UserPlus, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { RegisterCredentials, FormErrors } from '../../../types';
import { Button } from '../../ui/Button';

interface RegisterFormProps {
  onSubmit: (credentials: RegisterCredentials) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

// Validation regex patterns
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

// Password strength validation
function getPasswordStrength(password: string): {
  score: number;
  feedback: string[];
  isValid: boolean;
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('At least 8 characters');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('One lowercase letter');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('One uppercase letter');
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('One number');
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('One special character');
  }

  return {
    score,
    feedback,
    isValid: score >= 4
  };
}

// Form validation
function validateRegisterForm(credentials: RegisterCredentials & { confirmPassword: string }): FormErrors {
  const errors: FormErrors = {};

  // Username validation
  if (!credentials.username.trim()) {
    errors.username = 'Username is required';
  } else if (!usernameRegex.test(credentials.username)) {
    errors.username = 'Username must be 3-20 characters, letters, numbers, and underscores only';
  }

  // Email validation
  if (!credentials.email.trim()) {
    errors.email = 'Email is required';
  } else if (!emailRegex.test(credentials.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Password validation
  if (!credentials.password) {
    errors.password = 'Password is required';
  } else {
    const passwordStrength = getPasswordStrength(credentials.password);
    if (!passwordStrength.isValid) {
      errors.password = 'Password must meet security requirements';
    }
  }

  // Confirm password validation
  if (!credentials.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (credentials.password !== credentials.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
}

export function RegisterForm({ onSubmit, isLoading, error, className = '' }: RegisterFormProps) {
  const [credentials, setCredentials] = useState<RegisterCredentials & { confirmPassword: string }>({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  const passwordStrength = getPasswordStrength(credentials.password);

  const handleInputChange = (field: keyof typeof credentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateRegisterForm(credentials);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = credentials;
      await onSubmit(registerData);
    } catch (err) {
      // Error handling is done in parent component
      console.error('Registration failed:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Create Your Account
        </h2>
        <p className="text-center text-gray-600">
          Join DevBlog and start sharing your ideas with the world
        </p>
      </div>

      {/* Global error message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Username field */}
      <div className="space-y-1">
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={credentials.username}
          onChange={(e) => handleInputChange('username', e.target.value)}
          className={`
            w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
            ${fieldErrors.username ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
          `}
          placeholder="Choose a username"
          disabled={isLoading}
          autoComplete="username"
        />
        {fieldErrors.username && (
          <p className="text-sm text-red-600">{fieldErrors.username}</p>
        )}
      </div>

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
            placeholder="Create a strong password"
            disabled={isLoading}
            autoComplete="new-password"
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
        
        {/* Password strength indicator */}
        {credentials.password && (
          <div className="space-y-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded ${
                    level <= passwordStrength.score
                      ? passwordStrength.score <= 2
                        ? 'bg-red-400'
                        : passwordStrength.score <= 3
                        ? 'bg-yellow-400'
                        : 'bg-green-400'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            {passwordStrength.feedback.length > 0 && (
              <div className="text-xs text-gray-600">
                Required: {passwordStrength.feedback.join(', ')}
              </div>
            )}
            {passwordStrength.isValid && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <Check className="h-3 w-3" />
                Strong password
              </div>
            )}
          </div>
        )}
        
        {fieldErrors.password && (
          <p className="text-sm text-red-600">{fieldErrors.password}</p>
        )}
      </div>

      {/* Confirm password field */}
      <div className="space-y-1">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={credentials.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className={`
              w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500
              ${fieldErrors.confirmPassword ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
            `}
            placeholder="Confirm your password"
            disabled={isLoading}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            disabled={isLoading}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>
        {fieldErrors.confirmPassword && (
          <p className="text-sm text-red-600">{fieldErrors.confirmPassword}</p>
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
            <span>Creating Account...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <UserPlus className="h-4 w-4" />
            <span>Create Account</span>
          </div>
        )}
      </Button>

      {/* Terms notice */}
      <p className="text-xs text-gray-600 text-center">
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  );
}