
import * as React from 'react';
import clsx from 'clsx';

export interface ProjectCardProps {
  imageUrl: string;
  title: string;
  tags?: string[];
  className?: string;
}

export function ProjectCard({ imageUrl, title, tags = [], className }: ProjectCardProps) {
  return (
    <article className={clsx("rounded-2xl border border-gray-200 bg-gray-0 overflow-hidden shadow-sm", className)}>
      <div className="aspect-[4/3] relative">
        <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute left-4 top-4 h-2 w-12 bg-brand-accent" />
      </div>
      <div className="p-5">
        <h3 className="font-medium text-gray-900">{title}</h3>
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((t, i) => <span key={i} className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 border border-gray-200">{t}</span>)}
          </div>
        )}
      </div>
    </article>
  );
}
