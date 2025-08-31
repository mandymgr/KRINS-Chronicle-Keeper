import React from 'react';
import { CoordinationCardProps } from '../../../types/coordination.types';

export const CoordinationCard: React.FC<CoordinationCardProps> = ({
  children,
  className = '',
  size = 'md',
  hover = true
}) => {
  const sizeClasses = {
    sm: 'coordination-card-sm',
    md: 'coordination-card-md', 
    lg: 'coordination-card-lg'
  };

  return (
    <div className={`
      coordination-card ${sizeClasses[size]}
      ${hover ? 'hover:transform hover:-translate-y-0.5' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default CoordinationCard;