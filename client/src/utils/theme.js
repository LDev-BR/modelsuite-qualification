export const THEME_STORAGE_KEY = 'theme';
export const THEME_NAMES = ['light', 'dark'];

export const isThemeName = (theme) => THEME_NAMES.includes(theme);

export const resolveInitialTheme = ({ storedTheme, systemPrefersDark }) => {
  if (isThemeName(storedTheme)) return storedTheme;
  return systemPrefersDark ? 'dark' : 'light';
};

export const getSystemTheme = () => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const getStoredTheme = () => {
  if (typeof window === 'undefined') return null;
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemeName(storedTheme) ? storedTheme : null;
  } catch {
    return null;
  }
};
