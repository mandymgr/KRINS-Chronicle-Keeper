import React, { useEffect, useState } from 'react';
import { Tabs } from './Tabs';

export interface Theme {
  id: string;
  label: string;
  description?: string;
}

const AVAILABLE_THEMES: Theme[] = [
  { 
    id: 'chronicle-light', 
    label: 'Chronicle Light', 
    description: 'Professional organizational intelligence theme' 
  },
  { 
    id: 'chronicle-dark', 
    label: 'Chronicle Dark', 
    description: 'Dark mode for extended work sessions' 
  },
  { 
    id: 'ai-intelligence', 
    label: 'AI Intelligence', 
    description: 'Purple-tinted AI-focused theme' 
  },
  { 
    id: 'executive-dashboard', 
    label: 'Executive Dashboard', 
    description: 'Clean theme for executive presentations' 
  }
];

export interface ThemeSelectorProps {
  currentTheme?: string;
  onThemeChange?: (themeId: string) => void;
  className?: string;
}

export function ThemeSelector({ 
  currentTheme, 
  onThemeChange, 
  className = '' 
}: ThemeSelectorProps) {
  const [theme, setTheme] = useState(() => {
    return currentTheme || 
           document.documentElement.getAttribute('data-theme') || 
           'chronicle-light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    onThemeChange?.(theme);
  }, [theme, onThemeChange]);

  const items = AVAILABLE_THEMES.map(t => ({
    id: t.id,
    label: t.label,
    description: t.description
  }));

  return (
    <div className={`theme-selector ${className}`}>
      <Tabs
        items={items}
        value={theme}
        onChange={setTheme}
      />
    </div>
  );
}