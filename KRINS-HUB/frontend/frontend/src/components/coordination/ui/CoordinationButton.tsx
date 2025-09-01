import React from 'react';
import { CoordinationButtonProps } from '../../../types/coordination.types';

export const CoordinationButton: React.FC<CoordinationButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  loading = false,
  className = ''
}) => {
  const baseClasses = "coordination-btn inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "coordination-accent text-white hover:opacity-90 focus:ring-blue-500",
    secondary: "coordination-accent-secondary text-white hover:opacity-90 focus:ring-green-500",
    icon: "coordination-btn-icon",
    ghost: "border border-coordination text-coordination-primary hover:bg-coordination-card focus:ring-blue-500"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base", 
    lg: "px-6 py-3 text-lg"
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses} ${variantClasses[variant]} ${variant !== 'icon' ? sizeClasses[size] : ''}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
      )}
      {children}
    </button>
  );
};

export default CoordinationButton;