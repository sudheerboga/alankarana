import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { useTheme } from '../theme/ThemeProvider';

const AuthLayout = () => {
  const { colors } = useTheme();
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        backgroundColor: colors.bg,
        backgroundImage: `linear-gradient(135deg, ${colors.bg} 0%, ${colors.surfaceAlt} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        paddingTop: 'env(safe-area-inset-top, 16px)',
        paddingBottom: 'env(safe-area-inset-bottom, 16px)',
      }}
    >
      <Outlet />
    </Box>
  );
};

export default AuthLayout;
