import { Box, Paper, Typography } from '@mui/material';
import {
  HomeOutlined, HomeRounded,
  Inventory2Outlined, Inventory2Rounded,
  AddRounded,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeProvider';
import { ROUTES } from '../../constants';

const LEFT_ITEMS = [
  { label: 'Home', value: ROUTES.DASHBOARD, icon: HomeOutlined, activeIcon: HomeRounded },
];

const RIGHT_ITEMS = [
  { label: 'Items', value: ROUTES.ITEMS, icon: Inventory2Outlined, activeIcon: Inventory2Rounded },
];

const NavTab = ({ item, isActive, onClick }) => {
  const { colors } = useTheme();
  const Icon = isActive ? item.activeIcon : item.icon;

  return (
    <Box
      onClick={onClick}
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        py: 1,
        gap: 0.25,
        position: 'relative',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <Icon
        sx={{
          fontSize: 24,
          color: isActive ? colors.primary : colors.textMuted,
          transition: 'color 0.18s ease',
        }}
      />
      <Typography
        sx={{
          fontSize: 10.5,
          fontWeight: isActive ? 600 : 500,
          color: isActive ? colors.primary : colors.textMuted,
          letterSpacing: '0.01em',
          lineHeight: 1,
          transition: 'all 0.18s ease',
        }}
      >
        {item.label}
      </Typography>
    </Box>
  );
};

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { colors, zIndex } = useTheme();

  const isActive = (route) => {
    if (route === ROUTES.DASHBOARD) return location.pathname === '/';
    return location.pathname.startsWith(route);
  };

  const handleTabClick = (item) => {
    navigate(item.value);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: zIndex.fixed,
        borderTop: `1px solid ${colors.border}`,
        backgroundColor: colors.surface,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        borderRadius: 0,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          height: 72,
          position: 'relative',
        }}
      >
        {/* Left tabs */}
        {LEFT_ITEMS.map((item) => (
          <NavTab
            key={item.value}
            item={item}
            isActive={isActive(item.value)}
            onClick={() => handleTabClick(item)}
          />
        ))}

        {/* Spacer for center FAB */}
        <Box sx={{ width: 72, flexShrink: 0 }} />

        {/* Right tabs */}
        {RIGHT_ITEMS.map((item) => (
          <NavTab
            key={item.value}
            item={item}
            isActive={isActive(item.value)}
            onClick={() => handleTabClick(item)}
          />
        ))}
      </Box>

      {/* Center FAB — quick new sale */}
      <Box
        onClick={() => navigate(ROUTES.SALE_NEW)}
        sx={{
          position: 'absolute',
          left: '50%',
          top: -24,
          transform: 'translateX(-50%)',
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: `0 4px 16px ${colors.primary}40, 0 2px 4px ${colors.primary}30`,
          transition: 'transform 0.18s ease',
          '&:active': { transform: 'translateX(-50%) scale(0.92)' },
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <AddRounded sx={{ fontSize: 28, color: '#fff' }} />
      </Box>
    </Paper>
  );
};

export default BottomNav;
