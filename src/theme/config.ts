import { Theme, ThemeMode } from '@/types';

export const THEMES: Theme[] = [
  {
    id: 'light',
    name: 'Light',
    colors: {
      background: '0 0% 100%',
      foreground: '222.2 84% 4.9%',
      primary: '221.2 83.2% 53.3%',
      secondary: '210 40% 96%',
      accent: '210 40% 96%',
      muted: '210 40% 96%',
      border: '214.3 31.8% 91.4%',
      destructive: '0 84.2% 60.2%',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    colors: {
      background: '222.2 84% 4.9%',
      foreground: '210 40% 98%',
      primary: '217.2 91.2% 59.8%',
      secondary: '217.2 32.6% 17.5%',
      accent: '217.2 32.6% 17.5%',
      muted: '217.2 32.6% 17.5%',
      border: '217.2 32.6% 17.5%',
      destructive: '0 62.8% 30.6%',
    },
  },
  {
    id: 'corporate',
    name: 'Corporate Blue',
    colors: {
      background: '210 100% 98%',
      foreground: '210 100% 15%',
      primary: '210 100% 50%',
      secondary: '210 60% 90%',
      accent: '210 80% 85%',
      muted: '210 60% 95%',
      border: '210 40% 85%',
      destructive: '0 75% 55%',
    },
  },
  {
    id: 'playful',
    name: 'Playful Purple',
    colors: {
      background: '300 100% 98%',
      foreground: '300 100% 15%',
      primary: '280 100% 60%',
      secondary: '320 60% 90%',
      accent: '290 80% 85%',
      muted: '310 60% 95%',
      border: '310 40% 85%',
      destructive: '350 75% 55%',
    },
  },
];

export const DEFAULT_THEME_MODE: ThemeMode = 'system';
export const DEFAULT_THEME: Theme = THEMES[0] || {
  id: 'light',
  name: 'Light',
  colors: {
    background: '0 0% 100%',
    foreground: '222.2 84% 4.9%',
    primary: '221.2 83.2% 53.3%',
    secondary: '210 40% 96%',
    accent: '210 40% 96%',
    muted: '210 40% 96%',
    border: '214.3 31.8% 91.4%',
    destructive: '0 84.2% 60.2%',
  },
};

export const THEME_STORAGE_KEY = 'admin-template-theme';
export const THEME_MODE_STORAGE_KEY = 'admin-template-theme-mode';

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: Theme, mode: ThemeMode) {
  const root = document.documentElement;
  const isDarkMode = mode === 'dark' || (mode === 'system' && getSystemTheme() === 'dark');
  
  // Remove all theme classes
  root.className = root.className.replace(/theme-\w+/g, '');
  
  // Add dark class if needed
  root.classList.toggle('dark', isDarkMode);
  
  // Add theme class if not default light/dark theme
  if (theme.id !== 'light' && theme.id !== 'dark') {
    root.classList.add(`theme-${theme.id}`);
  }
  
  // Apply CSS variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
}

export function saveThemePreference(theme: Theme, mode: ThemeMode) {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(THEME_STORAGE_KEY, theme.id);
  localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
}

export function getStoredThemePreference(): { theme: Theme; mode: ThemeMode } {
  if (typeof window === 'undefined') {
    return { theme: DEFAULT_THEME, mode: DEFAULT_THEME_MODE };
  }
  
  const storedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
  const storedMode = localStorage.getItem(THEME_MODE_STORAGE_KEY);
  
  let theme = DEFAULT_THEME;
  if (storedThemeId) {
    const foundTheme = THEMES.find(t => t.id === storedThemeId);
    if (foundTheme) {
      theme = foundTheme;
    }
  }
  const mode = storedMode && ['light', 'dark', 'system'].includes(storedMode) ? storedMode as ThemeMode : DEFAULT_THEME_MODE;
  
  return { theme, mode };
}