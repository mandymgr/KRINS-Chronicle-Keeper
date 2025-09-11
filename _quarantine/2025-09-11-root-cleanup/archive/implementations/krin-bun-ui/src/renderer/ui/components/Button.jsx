import React from 'react';
export default function Button({ variant='accent', className='', children, ...rest }){
  const base = 'inline-flex items-center justify-center px-4 py-2 text-[16px] rounded-md transition';
  const map = {
    accent: 'bg-accent text-[var(--accent-ink)] hover:opacity-95',
    ghost: 'bg-transparent text-ink hover:bg-stone-100',
    outline: 'bg-transparent text-ink border border-stone-200 hover:border-ink',
  };
  return <button className={`${base} ${map[variant]} ${className}`} {...rest}>{children}</button>;
}
