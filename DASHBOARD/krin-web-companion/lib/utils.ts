import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function getTrendDisplay(trend: 'up' | 'down' | 'neutral'): { icon: string; color: string } {
  switch (trend) {
    case 'up':
      return { icon: '↗', color: 'text-green-500' }
    case 'down':
      return { icon: '↘', color: 'text-red-500' }
    default:
      return { icon: '→', color: 'text-gray-500' }
  }
}