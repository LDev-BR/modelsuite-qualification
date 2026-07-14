import { useTheme } from '../context/ThemeContext';

const SunIcon = () => (
  <svg className="theme-toggle__sun" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg className="theme-toggle__moon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.2 14.8A7.8 7.8 0 0 1 9.2 3.8 8.8 8.8 0 1 0 20.2 14.8Z" />
  </svg>
);

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const nextThemeLabel = isDark ? 'light' : 'dark';

  return (
    <button
      type="button"
      className={`theme-toggle ${isDark ? 'is-dark' : 'is-light'} ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={`Switch to ${nextThemeLabel} theme`}
      aria-pressed={isDark}
      title={`Switch to ${nextThemeLabel} theme`}>
      <span className="theme-toggle__track" aria-hidden="true">
        <span className="theme-toggle__stars" />
        <span className="theme-toggle__thumb">
          <SunIcon />
          <MoonIcon />
        </span>
      </span>
    </button>
  );
};

export default ThemeToggle;
