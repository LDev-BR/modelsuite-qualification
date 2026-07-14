/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  getStoredTheme,
  getSystemTheme,
  isThemeName,
  resolveInitialTheme,
  THEME_STORAGE_KEY,
} from '../utils/theme';

const ThemeContext = createContext(null);

const applyThemeToDocument = (theme) => {
  if (typeof document === 'undefined') return;

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
};

const getInitialThemeState = () => {
  const storedTheme = getStoredTheme();

  return {
    hasUserPreference: storedTheme !== null,
    theme: resolveInitialTheme({
      storedTheme,
      systemPrefersDark: getSystemTheme() === 'dark',
    }),
  };
};

export const ThemeProvider = ({ children }) => {
  const [themeState, setThemeState] = useState(getInitialThemeState);
  const { theme, hasUserPreference } = themeState;

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  useEffect(() => {
    if (hasUserPreference || typeof window === 'undefined' || !window.matchMedia) {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (event) => {
      setThemeState((current) => {
        if (current.hasUserPreference) return current;
        return { ...current, theme: event.matches ? 'dark' : 'light' };
      });
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }

    mediaQuery.addListener(handleSystemThemeChange);
    return () => mediaQuery.removeListener(handleSystemThemeChange);
  }, [hasUserPreference]);

  const setThemePreference = useCallback((nextTheme) => {
    if (!isThemeName(nextTheme)) return;

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Theme still changes in-memory when localStorage is unavailable.
    }

    setThemeState({ theme: nextTheme, hasUserPreference: true });
  }, []);

  const toggleTheme = useCallback(() => {
    setThemePreference(theme === 'dark' ? 'light' : 'dark');
  }, [setThemePreference, theme]);

  const value = useMemo(
    () => ({
      hasUserPreference,
      setTheme: setThemePreference,
      theme,
      toggleTheme,
    }),
    [hasUserPreference, setThemePreference, theme, toggleTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
