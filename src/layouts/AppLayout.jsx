import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import BottomNav from '../components/layout/BottomNav';
import OfflineIndicator from '../components/feedback/OfflineIndicator';
import { useTheme } from '../theme/ThemeProvider';

/**
 * Standard authenticated shell. Pages choose their own TopBar (so they can
 * include back buttons, custom actions, etc.) — we just provide the
 * scrollable content area and bottom nav.
 */
const AppLayout = () => {
  const { colors } = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        backgroundColor: colors.bg,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <OfflineIndicator />
      <Box
        component="main"
        sx={{
          flex: 1,
          paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <Outlet />
      </Box>
      <BottomNav />
    </Box>
  );
};

export default AppLayout;
