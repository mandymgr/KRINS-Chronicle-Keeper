import React from 'react';
export default function Sidebar({ items, title='Krin' }){
  return (
    <aside className="border-r border-stone-200 p-6" style={{minWidth:260}}>
      <div className="uppercase tracking-[.08em] text-xs text-stone-500">{title}</div>
      <nav className="mt-6 space-y-2">
        {items.map(i => <a key={i.href} href={i.href} className="block text-[16px] border-b border-stone-200 pb-1 hover:border-ink">{i.label}</a>)}
      </nav>
    </aside>
  );
}
