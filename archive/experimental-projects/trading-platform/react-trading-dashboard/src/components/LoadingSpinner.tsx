import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'border-blue-500',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-700 ${color} border-t-transparent h-full w-full`}></div>
    </div>
  )
}

export default LoadingSpinner