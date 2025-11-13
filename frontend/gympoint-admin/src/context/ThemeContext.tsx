import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';
type ThemeSource = 'system' | 'manual';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Detectar tema del sistema
  const getSystemTheme = (): Theme => {
    if (typeof window === 'undefined') {
      return 'light';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [themeSource, setThemeSource] = useState<ThemeSource>(() => {
    if (typeof window === 'undefined') return 'system';
    const savedSource = localStorage.getItem('theme_source') as ThemeSource | null;
    return savedSource || 'system';
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    const savedSource = localStorage.getItem('theme_source') as ThemeSource | null;
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedSource === 'manual' && savedTheme) {
      return savedTheme;
    }
    return getSystemTheme();
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
    localStorage.setItem('theme_source', themeSource);
  }, [theme, themeSource]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      if (themeSource === 'system') {
        setThemeState(event.matches ? 'dark' : 'light');
      }
    };

    // Ejecutar una vez para sincronizar en SSR/hidratación
    handleChange(mediaQuery);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [themeSource]);

  const setTheme = (newTheme: Theme) => {
    setThemeSource('manual');
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeSource('manual');
    setThemeState((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
