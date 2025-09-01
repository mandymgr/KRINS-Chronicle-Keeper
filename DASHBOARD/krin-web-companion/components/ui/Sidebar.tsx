import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface SidebarItem {
  href: string
  label: string
  icon?: React.ReactNode
  active?: boolean
}

interface SidebarProps {
  title?: string
  items: SidebarItem[]
  className?: string
}

export default function Sidebar({ title = 'Living Spec Dashboard', items, className }: SidebarProps) {
  return (
    <aside 
      className={cn(
        'border-r border-stone-200 p-6 bg-paper min-h-screen',
        className
      )} 
      style={{ minWidth: 280 }}
    >
      <div className="kicker mb-6">
        {title}
      </div>
      
      <nav className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 text-base rounded-md transition-all',
              'border-b border-stone-200 pb-2 hover:border-ink hover:bg-stone-100',
              item.active && 'bg-stone-100 border-ink font-medium'
            )}
          >
            {item.icon && (
              <span className="text-stone-500">
                {item.icon}
              </span>
            )}
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}