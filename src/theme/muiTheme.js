import { createTheme } from '@mui/material/styles';
import { palette, typography, radius, shadow, touchTarget } from './tokens';

/**
 * Build an MUI theme from our token system.
 * MUI components inherit colors automatically; custom components import tokens directly.
 */
export const buildMuiTheme = (mode = 'light') => {
  const p = palette[mode];

  return createTheme({
    palette: {
      mode,
      primary: { main: p.primary, dark: p.primaryHover, light: p.primaryLight, contrastText: p.textInverse },
      secondary: { main: p.accent, dark: p.accentHover, contrastText: p.textInverse },
      error: { main: p.danger },
      warning: { main: p.warning },
      success: { main: p.success },
      info: { main: p.info },
      background: { default: p.bg, paper: p.surface },
      text: { primary: p.text, secondary: p.textSecondary, disabled: p.textMuted },
      divider: p.border,
    },
    typography: {
      fontFamily: typography.fontBody,
      h1: { fontFamily: typography.fontDisplay, fontWeight: 600 },
      h2: { fontFamily: typography.fontDisplay, fontWeight: 600 },
      h3: { fontFamily: typography.fontDisplay, fontWeight: 600 },
      h4: { fontFamily: typography.fontDisplay, fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.02em' },
    },
    shape: {
      borderRadius: parseInt(radius.md, 10),
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: radius.md,
            minHeight: touchTarget,
            paddingLeft: 20,
            paddingRight: 20,
            transition: 'all 0.2s ease',
          },
          containedPrimary: {
            boxShadow: shadow.sm,
            '&:hover': { boxShadow: shadow.md },
          },
        },
      },
      MuiTextField: {
        defaultProps: { variant: 'outlined', size: 'medium' },
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: radius.md,
              backgroundColor: p.surface,
              fontSize: '16px', // Prevents iOS zoom on focus
            },
          },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            borderRadius: radius.lg,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: radius.lg,
            backgroundColor: p.surface,
            border: `1px solid ${p.border}`,
            boxShadow: shadow.sm,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 500, borderRadius: radius.full },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: { minWidth: touchTarget, minHeight: touchTarget },
        },
      },
      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            height: 64,
            backgroundColor: p.surface,
            borderTop: `1px solid ${p.border}`,
          },
        },
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            minWidth: 'auto',
            padding: '8px 12px',
            '&.Mui-selected': { color: p.primary },
          },
        },
      },
    },
  });
};
