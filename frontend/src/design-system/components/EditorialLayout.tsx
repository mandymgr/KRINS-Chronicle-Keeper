
import * as React from 'react';

export interface EditorialLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function EditorialLayout({ children, className = '' }: EditorialLayoutProps) {
  return (
    <div 
      className={`max-w-6xl mx-auto px-6 md:px-10 lg:px-20 space-y-16 ${className}`}
      style={{ 
        paddingTop: 'var(--space-16)',
        paddingBottom: 'var(--space-16)',
        fontFamily: 'var(--font-sans)'
      }}
    >
      {children}
    </div>
  );
}
