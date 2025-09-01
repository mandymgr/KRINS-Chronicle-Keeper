import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    variant = 'default',
    className = '',
    id,
    ...props
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    
    const baseInputClasses = 'block w-full rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      default: 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400',
      filled: 'border-transparent bg-gray-100 text-gray-900 placeholder-gray-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400',
    };
    
    const errorClasses = error 
      ? 'border-red-500 focus:ring-red-500 dark:border-red-400' 
      : '';
    
    const paddingClasses = leftIcon && rightIcon 
      ? 'pl-10 pr-10 py-3'
      : leftIcon 
      ? 'pl-10 pr-4 py-3'
      : rightIcon 
      ? 'pl-4 pr-10 py-3'
      : 'px-4 py-3';

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="h-5 w-5 text-gray-400">
                {leftIcon}
              </div>
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={`${baseInputClasses} ${variantClasses[variant]} ${errorClasses} ${paddingClasses} ${className}`}
            aria-invalid={!!error}
            aria-describedby={
              error ? `${inputId}-error` : 
              helperText ? `${inputId}-helper` : 
              undefined
            }
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="h-5 w-5 text-gray-400">
                {rightIcon}
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <p 
            id={`${inputId}-error`} 
            className="mt-2 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p 
            id={`${inputId}-helper`} 
            className="mt-2 text-sm text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);