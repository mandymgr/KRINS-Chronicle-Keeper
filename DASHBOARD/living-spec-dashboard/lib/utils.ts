import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to localized string
 */
export function formatDate(date: string | Date, locale = 'nb-NO'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format date to relative time (e.g., "2 days ago")
 */
export function formatRelativeDate(date: string | Date, locale = 'nb-NO'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  const intervals = [
    { label: locale === 'nb-NO' ? 'år' : 'year', seconds: 31536000, plural: locale === 'nb-NO' ? 'år' : 'years' },
    { label: locale === 'nb-NO' ? 'måned' : 'month', seconds: 2592000, plural: locale === 'nb-NO' ? 'måneder' : 'months' },
    { label: locale === 'nb-NO' ? 'uke' : 'week', seconds: 604800, plural: locale === 'nb-NO' ? 'uker' : 'weeks' },
    { label: locale === 'nb-NO' ? 'dag' : 'day', seconds: 86400, plural: locale === 'nb-NO' ? 'dager' : 'days' },
    { label: locale === 'nb-NO' ? 'time' : 'hour', seconds: 3600, plural: locale === 'nb-NO' ? 'timer' : 'hours' },
    { label: locale === 'nb-NO' ? 'minutt' : 'minute', seconds: 60, plural: locale === 'nb-NO' ? 'minutter' : 'minutes' },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      const unit = count === 1 ? interval.label : interval.plural;
      return locale === 'nb-NO' ? `${count} ${unit} siden` : `${count} ${unit} ago`;
    }
  }
  
  return locale === 'nb-NO' ? 'nettopp nå' : 'just now';
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Generate a color based on string hash (for consistent tag colors)
 */
export function getColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
    'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  ];
  
  return colors[Math.abs(hash) % colors.length] ?? colors[0]!;
}

/**
 * Calculate completion percentage
 */
export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Format number with locale-specific formatting
 */
export function formatNumber(
  num: number,
  locale = 'nb-NO',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(num);
}

/**
 * Format currency
 */
export function formatCurrency(
  amount: number,
  currency = 'NOK',
  locale = 'nb-NO'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Get status color classes
 */
export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    // General status colors
    completed: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300',
    'in-progress': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300',
    planned: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300',
    blocked: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300',
    'at-risk': 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300',
    
    // Task status
    backlog: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300',
    todo: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400',
    done: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300',
    
    // Priority colors
    low: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300',
    medium: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300',
    high: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-300',
    critical: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300',
    
    // Health status
    healthy: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300',
    error: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300',
    maintenance: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300',
  };
  
  return statusColors[status.toLowerCase()] ?? statusColors['planned']!;
}

/**
 * Get priority icon
 */
export function getPriorityIcon(priority: string): string {
  const icons: Record<string, string> = {
    low: '⬇️',
    medium: '➡️',
    high: '⬆️',
    critical: '🚨',
  };
  
  return icons[priority.toLowerCase()] ?? icons['medium']!;
}

/**
 * Get trend icon and color
 */
export function getTrendDisplay(trend: 'up' | 'down' | 'stable'): { icon: string; color: string } {
  const trends = {
    up: { icon: '📈', color: 'text-green-600' },
    down: { icon: '📉', color: 'text-red-600' },
    stable: { icon: '➡️', color: 'text-gray-600' },
  };
  
  return trends[trend] || trends.stable;
}

/**
 * Parse markdown front matter and content
 */
export function parseMarkdownWithFrontmatter(content: string): {
  frontmatter: Record<string, any>;
  content: string;
} {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { frontmatter: {}, content };
  }
  
  const frontmatterText = match[1] || '';
  const markdownContent = match[2] || '';
  
  // Simple YAML parser (for basic key-value pairs)
  const frontmatter: Record<string, any> = {};
  frontmatterText.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim().replace(/['"]/g, '');
      frontmatter[key.trim()] = value;
    }
  });
  
  return { frontmatter, content: markdownContent };
}

/**
 * Generate slug from title
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}