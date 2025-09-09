
import * as React from 'react';
import clsx from 'clsx';

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={clsx('glass-card p-6', className)} 
      style={{ 
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-md)'
      }}
      {...props} 
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('flex flex-col space-y-1.5 pb-6', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 
      className={clsx('text-2xl font-semibold leading-none tracking-tight', className)} 
      style={{ 
        fontFamily: 'var(--font-display)',
        color: 'var(--gray-800)'
      }}
      {...props} 
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p 
      className={clsx('text-sm text-muted-foreground', className)} 
      style={{ color: 'var(--gray-600)' }}
      {...props} 
    />
  );
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('pt-0', className)} {...props} />;
}
