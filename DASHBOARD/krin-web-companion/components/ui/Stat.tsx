import React from 'react'
import { cn } from '@/lib/utils'

interface StatProps {
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  className?: string
}

export default function Stat({ 
  label, 
  value, 
  change, 
  trend = 'neutral', 
  icon, 
  className 
}: StatProps) {
  const trendColors = {
    up: 'text-ai-active',
    down: 'text-red-500',
    neutral: 'text-stone-500'
  }

  return (
    <div className={cn('card p-6', className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="kicker">
          {label}
        </div>
        {icon && (
          <div className="text-stone-500">
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-end gap-2">
        <div className="font-serif text-2xl text-[var(--color-ink)]">
          {value}
        </div>
        
        {change && (
          <div className={cn('text-sm font-medium', trendColors[trend])}>
            {change}
          </div>
        )}
      </div>
    </div>
  )
}