import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { palette, typography, spacing, radius, shadow, motion, breakpoint, zIndex, touchTarget } from './tokens';
import { buildMuiTheme } from './muiTheme';

const STORAGE_KEY = 'alankarana:theme';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

const getInitialMode = () => {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'light';
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(getInitialMode);

  const toggleMode = useCallback(() => {
    setMode((m) => (m === 'light' ? 'light' : 'light'));
    setMode((m) => (m === 'light' ? 'light' : 'light'));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
    // Update theme-color meta for native app feel
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', palette[mode].bg);
    // Set body bg directly to prevent flash between routes
    document.body.style.backgroundColor = palette[mode].bg;
    document.body.style.color = palette[mode].text;
  }, [mode]);

  // Expose CSS variables for non-MUI components
  useEffect(() => {
    const root = document.documentElement;
    const p = palette[mode];
    Object.entries(p).forEach(([key, val]) => {
      root.style.setProperty(`--color-${key}`, val);
    });
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      toggleMode,
      colors: palette[mode],
      typography,
      spacing,
      radius,
      shadow,
      motion,
      breakpoint,
      zIndex,
      touchTarget,
    }),
    [mode, toggleMode]
  );

  const muiTheme = useMemo(() => buildMuiTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
