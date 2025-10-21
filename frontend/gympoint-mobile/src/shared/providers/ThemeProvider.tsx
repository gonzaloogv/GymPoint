import React, { createContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app_theme_mode';

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const saved = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
      if (saved && ['light', 'dark', 'auto'].includes(saved)) {
        setThemeModeState(saved as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await SecureStore.setItemAsync(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const isDark = themeMode === 'auto' 
    ? deviceTheme === 'dark' 
    : themeMode === 'dark';

  const theme = isDark ? 'dark' : 'light';

  if (isLoading) {
    return null;
  }

  const contextValue: ThemeContextType = {
    theme,
    themeMode,
    setThemeMode,
    isDark,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};