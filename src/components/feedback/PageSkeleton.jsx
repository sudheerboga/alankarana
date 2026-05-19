import { Box, Skeleton } from '@mui/material';
import { useTheme } from '../../theme/ThemeProvider';

const PageSkeleton = () => {
  const { colors } = useTheme();
  return (
    <Box sx={{ p: 2, minHeight: '100dvh', backgroundColor: colors.bg }}>
      <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1, mb: 2 }} />
      <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 2 }} />
      <Skeleton variant="rectangular" height={88} sx={{ borderRadius: 2, mb: 1.5 }} />
      <Skeleton variant="rectangular" height={88} sx={{ borderRadius: 2, mb: 1.5 }} />
      <Skeleton variant="rectangular" height={88} sx={{ borderRadius: 2 }} />
    </Box>
  );
};

export default PageSkeleton;
