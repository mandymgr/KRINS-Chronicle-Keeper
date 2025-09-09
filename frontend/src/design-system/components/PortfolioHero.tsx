
import * as React from 'react';
import clsx from 'clsx';

export interface PortfolioHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  className?: string;
}

export function PortfolioHero({ eyebrow, title, subtitle, imageUrl, className }: PortfolioHeroProps) {
  return (
    <section className={clsx("relative grid gap-6 md:grid-cols-[1.1fr_1fr] items-stretch", className)}>
      <div className="relative rounded-2xl border border-gray-200 bg-gray-0 p-8 md:p-12 shadow-sm overflow-hidden">
        <div className="absolute -top-2 -left-2 h-2 w-1/2 bg-brand-accent" />
        <div className="absolute -bottom-2 -right-2 h-2 w-1/3 bg-brand-accent" />
        {eyebrow && <div className="uppercase tracking-[0.2em] text-xs text-gray-600 mb-3">{eyebrow}</div>}
        <h1 className="font-serif text-4xl md:text-6xl leading-[1.05] text-gray-900">{title}</h1>
        {subtitle && <p className="mt-4 text-gray-600 max-w-prose">{subtitle}</p>}
      </div>
      <div className="relative rounded-2xl overflow-hidden bg-gray-900">
        {imageUrl ? (
          <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90" />
        ) : (
          <div className="absolute inset-0" style={{ backgroundImage: 'var(--pattern-stripes)' }} />
        )}
        <div className="absolute top-6 left-6 px-3 py-1 rounded-full bg-brand-accent text-black text-xs font-medium">Featured</div>
      </div>
    </section>
  );
}
