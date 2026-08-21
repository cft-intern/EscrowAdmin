import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, ThemeMode } from '@/types';
import {
  THEMES,
  DEFAULT_THEME,
  DEFAULT_THEME_MODE,
  applyTheme,
  saveThemePreference,
  getStoredThemePreference,
  getSystemTheme,
} from './config';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  availableThemes: Theme[];
  setTheme: (theme: Theme) => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const { theme: storedTheme } = getStoredThemePreference();
    return storedTheme;
  });
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    const { mode: storedMode } = getStoredThemePreference();
    return storedMode;
  });

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    applyTheme(theme, themeMode);
  }, []);

  // Listen for system theme changes when mode is 'system'
  useEffect(() => {
    if (themeMode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyTheme(theme, themeMode);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, themeMode]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme, themeMode);
    saveThemePreference(newTheme, themeMode);
  };

  const setThemeMode = (newMode: ThemeMode) => {
    setThemeModeState(newMode);
    applyTheme(theme, newMode);
    saveThemePreference(theme, newMode);
  };

  const toggleTheme = () => {
    if (themeMode === 'system') {
      const systemTheme = getSystemTheme();
      setThemeMode(systemTheme === 'dark' ? 'light' : 'dark');
    } else {
      setThemeMode(themeMode === 'light' ? 'dark' : 'light');
    }
  };

  const value: ThemeContextType = {
    theme,
    themeMode,
    availableThemes: THEMES,
    setTheme,
    setThemeMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}