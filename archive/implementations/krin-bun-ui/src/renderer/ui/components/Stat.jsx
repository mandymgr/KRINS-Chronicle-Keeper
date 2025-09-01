import React from 'react';
export default function Stat({ label, value }){
  return (
    <div className="p-5 border border-stone-200 rounded-lg">
      <div className="uppercase tracking-[.08em] text-xs text-stone-500">{label}</div>
      <div className="font-serif text-[28px] leading-[1.2] mt-1">{value}</div>
    </div>
  );
}
