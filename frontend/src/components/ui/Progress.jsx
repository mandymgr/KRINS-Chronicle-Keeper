/**
 * 📊 Progress Component
 */

import React from 'react';

export const Progress = ({ value = 0, className = '', ...props }) => {
  return (
    <div className={`relative h-4 w-full overflow-hidden rounded-full bg-secondary ${className}`} {...props}>
      <div
        className="h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out"
        style={{ transform: `translateX(-${100 - Math.min(100, Math.max(0, value))}%)` }}
      />
    </div>
  );
};