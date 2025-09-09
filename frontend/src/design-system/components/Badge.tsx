
import * as React from 'react';
import clsx from 'clsx';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  children: React.ReactNode;
}

export function Badge({ children, variant = 'default', className, ...props }: BadgeProps) {
  const variants = {
    default: 'decision-chip--accepted',
    secondary: 'decision-chip--proposed', 
    outline: 'decision-chip--superseded',
    destructive: 'decision-chip--rejected'
  };

  return (
    <span 
      className={clsx('decision-chip', variants[variant], className)} 
      style={{
        borderRadius: 'var(--radius-xl)',
        fontSize: '0.75rem',
        fontWeight: '500',
        padding: 'var(--space-1) var(--space-3)'
      }}
      {...props}
    >
      {children}
    </span>
  );
}
