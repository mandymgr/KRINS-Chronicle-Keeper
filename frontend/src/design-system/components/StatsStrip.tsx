
import * as React from 'react';

export interface Stat { label: string; value: string; }
export function StatsStrip({ stats }: { stats: Stat[] }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      <div className="h-2 bg-brand-accent" />
      <div className="grid md:grid-cols-3">
        {stats.map((s, i) => (
          <div key={i} className="p-6 bg-gray-0 border-t md:border-t-0 md:border-l border-gray-200">
            <div className="text-sm text-gray-500">{s.label}</div>
            <div className="font-serif text-3xl text-gray-900">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
