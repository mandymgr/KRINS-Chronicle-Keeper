import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';
import type { RegisterCredentials } from '../../types';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const { register, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<RegisterCredentials>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<RegisterCredentials>>({});

  const validateForm = (): boolean => {
    const errors: Partial<RegisterCredentials> = {};
    
    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, underscore and dash';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain at least one uppercase, lowercase, and number';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof RegisterCredentials) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear password match error when either password field changes
    if ((field === 'password' || field === 'confirmPassword') && formErrors.confirmPassword) {
      setFormErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
    
    // Clear auth error
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await register(formData);
    } catch (err) {
      // Error handling is done in the auth context
    }
  };

  const getPasswordStrength = (password: string): { score: number; text: string; color: string } => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    if (score <= 2) return { score, text: 'Weak', color: 'text-red-500' };
    if (score <= 4) return { score, text: 'Medium', color: 'text-yellow-500' };
    return { score, text: 'Strong', color: 'text-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create Account
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Join the conversation
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <Input
          type="text"
          placeholder="Choose a username"
          value={formData.username}
          onChange={handleInputChange('username')}
          error={formErrors.username}
          leftIcon={<User />}
          label="Username"
          autoComplete="username"
          minLength={3}
          maxLength={20}
          pattern="[a-zA-Z0-9_-]+"
          required
        />

        <Input
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange('email')}
          error={formErrors.email}
          leftIcon={<Mail />}
          label="Email"
          autoComplete="email"
          required
        />

        <div>
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a password"
            value={formData.password}
            onChange={handleInputChange('password')}
            error={formErrors.password}
            leftIcon={<Lock />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            }
            label="Password"
            autoComplete="new-password"
            minLength={6}
            required
          />
          
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Password strength:
                </span>
                <span className={`text-xs font-medium ${passwordStrength.color}`}>
                  {passwordStrength.text}
                </span>
              </div>
              <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    passwordStrength.score <= 2 
                      ? 'bg-red-500' 
                      : passwordStrength.score <= 4 
                      ? 'bg-yellow-500' 
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <Input
          type={showConfirmPassword ? 'text' : 'password'}
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleInputChange('confirmPassword')}
          error={formErrors.confirmPassword}
          leftIcon={<Lock />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff /> : <Eye />}
            </button>
          }
          label="Confirm Password"
          autoComplete="new-password"
          required
        />

        {error && (
          <div 
            className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            role="alert"
            aria-live="polite"
          >
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          loading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium focus:outline-none focus:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};