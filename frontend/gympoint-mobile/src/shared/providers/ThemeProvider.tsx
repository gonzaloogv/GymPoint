import { createContext, useState, useEffect } from 'react';
import { useColorScheme, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      let saved: string | null = null;

      // Use AsyncStorage for web, SecureStore for mobile
      if (Platform.OS === 'web') {
        saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      } else {
        saved = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
      }

      if (saved && ['light', 'dark', 'auto'].includes(saved)) {
        setThemeModeState(saved as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
      // Fallback to 'auto' on error - this is safe
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      } else {
        await SecureStore.setItemAsync(THEME_STORAGE_KEY, mode);
      }
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const isDark = themeMode === 'auto' 
    ? deviceTheme === 'dark' 
    : themeMode === 'dark';

  const theme = isDark ? 'dark' : 'light';

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