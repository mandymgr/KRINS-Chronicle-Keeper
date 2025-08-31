import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface ThemeContextType {
  isDarkTheme: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const CoordinationThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const saved = localStorage.getItem('coordination-theme');
    return saved ? saved === 'dark' : true; // Default til dark
  });

  const toggleTheme = useCallback(() => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    localStorage.setItem('coordination-theme', newTheme ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', newTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

  const setTheme = useCallback((theme: 'light' | 'dark') => {
    setIsDarkTheme(theme === 'dark');
    localStorage.setItem('coordination-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

  return (
    <ThemeContext.Provider value={{ isDarkTheme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useCoordinationTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useCoordinationTheme must be used within CoordinationThemeProvider');
  }
  return context;
};