
import * as React from 'react';
import clsx from 'clsx';

type Variant = 'underline' | 'pill';

export interface TabItem { 
  id: string; 
  label: string; 
  description?: string;
}
export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  variant?: Variant;
  className?: string;
}

export function Tabs({ items, value, onChange, variant = 'underline', className }: TabsProps) {
  return (
    <div className={clsx('w-full', className)}>
      <div className={clsx('flex gap-2 overflow-x-auto no-scrollbar')}>
        {items.map(it => (
          <button
            key={it.id}
            onClick={() => onChange(it.id)}
            className={clsx(
              'px-4 py-2 text-sm transition-colors',
              variant === 'underline'
                ? value === it.id
                  ? 'border-b-2 text-gray-800'
                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-800'
                : value === it.id
                ? 'text-gray-800 rounded-full'
                : 'text-gray-600 hover:text-gray-800 rounded-full'
            )}
            style={{
              borderBottomColor: value === it.id && variant === 'underline' 
                ? 'var(--color-brand-accent)' 
                : 'transparent',
              backgroundColor: value === it.id && variant === 'pill' 
                ? 'var(--gray-100)' 
                : variant === 'pill' && 'transparent',
              color: value === it.id 
                ? 'var(--gray-800)' 
                : 'var(--gray-600)',
              borderRadius: variant === 'pill' ? 'var(--radius-xl)' : undefined
            }}
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}
