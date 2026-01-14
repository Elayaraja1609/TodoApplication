import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { apiService } from '../services/api';
import { StorageService } from '../services/storage';

export type Theme = 'default' | 'light' | 'dark';

interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  error: string;
  success: string;
  card: string;
  header: string;
}

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  setTheme: (theme: Theme) => void;
  isLoading: boolean;
}

const lightColors: ThemeColors = {
  background: '#ffffff',
  surface: '#f5f5f5',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  primary: '#f97316',
  error: '#ef4444',
  success: '#10b981',
  card: '#ffffff',
  header: '#ffffff',
};

const darkColors: ThemeColors = {
  background: '#1e1b4b',
  surface: '#312e81',
  text: '#ffffff',
  textSecondary: '#9ca3af',
  border: '#312e81',
  primary: '#f97316',
  error: '#ef4444',
  success: '#10b981',
  card: '#312e81',
  header: '#1e1b4b',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('default');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      // Try to load from API first
      const preferences = await apiService.getUserPreferences();
      if (preferences.theme) {
        setThemeState(preferences.theme);
      } else {
        // Fallback to local storage
        const savedTheme = await StorageService.getItem('theme');
        if (savedTheme && ['default', 'light', 'dark'].includes(savedTheme)) {
          setThemeState(savedTheme as Theme);
        }
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
      // Fallback to local storage
      try {
        const savedTheme = await StorageService.getItem('theme');
        if (savedTheme && ['default', 'light', 'dark'].includes(savedTheme)) {
          setThemeState(savedTheme as Theme);
        }
      } catch (e) {
        console.error('Failed to load theme from storage:', e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    // Save to local storage
    await StorageService.setItem('theme', newTheme);
    // Note: Backend save is handled by SettingsScreen when user explicitly changes theme
  };

  const getColors = (): ThemeColors => {
    if (theme === 'light') {
      return lightColors;
    } else if (theme === 'dark') {
      return darkColors;
    } else {
      // Default: use system preference
      return systemColorScheme === 'dark' ? darkColors : lightColors;
    }
  };

  const colors = getColors();

  return (
    <ThemeContext.Provider value={{ theme, colors, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

