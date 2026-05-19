import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';
import {
  ArrowBackRounded,
  LightModeRounded,
  DarkModeRounded,
  MoreVertRounded,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * Universal top bar. Pass `back` to show a back button, `actions` for trailing icons.
 * Title uses the display serif for that boutique feel.
 */
const TopBar = ({ title, back = false, onBack, actions = null, transparent = false }) => {
  const navigate = useNavigate();
  const { colors, mode, toggleMode, typography, zIndex } = useTheme();

  const handleBack = () => {
    if (onBack) return onBack();
    if (window.history.length > 1) navigate(-1);
    else navigate('/');
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: transparent ? 'transparent' : colors.surface,
        color: colors.text,
        borderBottom: transparent ? 'none' : `1px solid ${colors.border}`,
        paddingTop: 'env(safe-area-inset-top, 0px)',
        zIndex: zIndex.sticky,
      }}
    >
      <Toolbar sx={{ minHeight: 56, gap: 1 }}>
        {back && (
          <IconButton edge="start" onClick={handleBack} aria-label="Back" sx={{ color: colors.text }}>
            <ArrowBackRounded />
          </IconButton>
        )}
        <Typography
          component="h1"
          sx={{
            flex: 1,
            fontFamily: typography.fontDisplay,
            fontSize: typography.size['2xl'],
            fontWeight: 600,
            letterSpacing: '0.02em',
            color: colors.text,
          }}
        >
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {actions}
          <IconButton
            onClick={toggleMode}
            aria-label="Toggle theme"
            sx={{ color: colors.textSecondary }}
          >
            {mode === 'light' ? <DarkModeRounded fontSize="small" /> : <LightModeRounded fontSize="small" />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
