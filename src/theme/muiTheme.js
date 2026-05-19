import { createTheme } from '@mui/material/styles';
import { palette, typography, radius, shadow, touchTarget } from './tokens';

/**
 * Build an MUI theme from our token system.
 * Modern minimal: flat cards (border, not shadow), generous padding,
 * refined typography, no aggressive accent colors.
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
      // Display variants — same Inter family, tighter tracking + heavier weight
      h1: { fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.1 },
      h2: { fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.15 },
      h3: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 },
      h4: { fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.25 },
      h5: { fontWeight: 600, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0' },
      body1: { letterSpacing: '-0.005em' },
      body2: { letterSpacing: '-0.005em' },
    },
    shape: {
      borderRadius: parseInt(radius.md, 10),
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: radius.full, // Pill buttons — modern feel
            minHeight: touchTarget,
            paddingLeft: 24,
            paddingRight: 24,
            fontSize: 14,
            transition: 'all 0.18s ease',
          },
          containedPrimary: {
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none', backgroundColor: p.primaryHover },
            '&:active': { transform: 'scale(0.98)' },
          },
          outlined: {
            borderColor: p.borderStrong,
            color: p.text,
            '&:hover': { borderColor: p.text, backgroundColor: 'transparent' },
          },
          sizeLarge: {
            fontSize: 15,
            paddingTop: 14,
            paddingBottom: 14,
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
              '& fieldset': { borderColor: p.border, transition: 'border-color 0.15s ease' },
              '&:hover fieldset': { borderColor: p.borderStrong },
              '&.Mui-focused fieldset': { borderColor: p.primary, borderWidth: 1.5 },
            },
            '& .MuiInputLabel-root': { color: p.textMuted },
            '& .MuiInputLabel-root.Mui-focused': { color: p.primary },
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
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: radius.lg,
            backgroundColor: p.surface,
            border: `1px solid ${p.border}`,
            boxShadow: 'none', // Borders, not shadows — minimal style
            transition: 'border-color 0.15s ease',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            borderRadius: radius.full,
            fontSize: 12,
            height: 24,
          },
          sizeSmall: { height: 20, fontSize: 11 },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            minWidth: touchTarget,
            minHeight: touchTarget,
            transition: 'background-color 0.15s ease',
            '&:hover': { backgroundColor: p.surfaceAlt },
          },
        },
      },
      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            height: 72,
            backgroundColor: p.surface,
            borderTop: `1px solid ${p.border}`,
          },
        },
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            minWidth: 'auto',
            padding: '10px 12px',
            color: p.textMuted,
            '&.Mui-selected': { color: p.primary, paddingTop: 10 },
            '& .MuiBottomNavigationAction-label': {
              fontSize: 11,
              fontWeight: 500,
              marginTop: 4,
              transition: 'font-size 0.15s ease',
            },
            '&.Mui-selected .MuiBottomNavigationAction-label': {
              fontSize: 11,
              fontWeight: 600,
            },
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: radius.xl },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: radius.md,
            border: `1px solid ${p.border}`,
            boxShadow: shadow.lg,
            marginTop: 8,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: 14,
            paddingTop: 10,
            paddingBottom: 10,
            '&.Mui-selected': { backgroundColor: p.primaryLight, color: p.primary },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: { borderColor: p.border },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: 14,
            letterSpacing: '-0.005em',
            minHeight: 48,
            '&.Mui-selected': { fontWeight: 600 },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 2,
            borderRadius: 2,
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: { padding: 8 },
          track: { borderRadius: 14 },
        },
      },
    },
  });
};
