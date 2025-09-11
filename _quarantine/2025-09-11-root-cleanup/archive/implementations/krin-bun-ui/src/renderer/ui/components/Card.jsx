import React from 'react';
export function Card({ className='', children, ...rest }){
  return <div className={`card p-6 ${className}`} {...rest}>{children}</div>
}
export function CardTitle({ children }){ return <h3 className="font-serif text-[22px] leading-[1.25] mb-1">{children}</h3>; }
export function CardSubtitle({ children }){ return <p className="text-stone-500 mb-4">{children}</p>; }
