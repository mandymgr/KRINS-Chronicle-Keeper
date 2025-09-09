
import * as React from 'react';
import clsx from 'clsx';

export interface TimelineItem {
  date: string;          // ISO date, e.g., '2025-09-01'
  title: string;
  detail?: string;
  icon?: 'milestone' | 'event' | 'note';
}

export interface TimelineProps {
  items: TimelineItem[];
  groupBy?: 'day' | 'month';
  className?: string;
}

function formatDate(dateStr: string, groupBy: 'day' | 'month') {
  const d = new Date(dateStr);
  if (groupBy === 'month') {
    return d.toLocaleString(undefined, { year: 'numeric', month: 'long' });
  }
  return d.toLocaleDateString();
}

export function Timeline({ items, groupBy = 'day', className }: TimelineProps) {
  const sorted = [...items].sort((a, b) => (a.date < b.date ? -1 : 1));
  const groups = new Map<string, TimelineItem[]>();
  for (const it of sorted) {
    const key = groupBy === 'month' ? it.date.slice(0, 7) : it.date;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(it);
  }

  const iconEl = (type: TimelineItem['icon']) => {
    const base = "h-3 w-3 rounded-full";
    switch (type) {
      case 'milestone': return <span className={clsx(base, 'bg-brand-accent')} />;
      case 'note': return <span className={clsx(base, 'bg-gray-400')} />;
      default: return <span className={clsx(base, 'bg-gray-600')} />;
    }
  };

  return (
    <div className={clsx('relative', className)}>
      <div className="absolute left-[7px] top-0 bottom-0 w-[2px] bg-gray-200" />
      <div className="space-y-6">
        {[...groups.entries()].map(([key, arr]) => (
          <section key={key}>
            <div className="mb-3 inline-flex items-center gap-2 pl-6">
              <span className="text-xs uppercase tracking-[0.15em] text-gray-500">{formatDate(key + (groupBy==='month' ? '-01' : ''), groupBy)}</span>
            </div>
            <ul className="space-y-4">
              {arr.map((it, i) => (
                <li key={i} className="grid md:grid-cols-[32px_1fr] gap-4 items-start">
                  <div className="flex items-center justify-center">
                    {iconEl(it.icon)}
                  </div>
                  <div className="p-4 rounded-2xl bg-gray-0 border border-gray-200 shadow-sm">
                    <div className="font-medium text-gray-800">{it.title}</div>
                    {it.detail && <div className="text-gray-600 mt-1">{it.detail}</div>}
                    <div className="text-xs text-gray-500 mt-2">{new Date(it.date).toLocaleString()}</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
