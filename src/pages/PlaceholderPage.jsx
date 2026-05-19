import { Box, Typography } from '@mui/material';
import TopBar from '../components/layout/TopBar';
import { useTheme } from '../theme/ThemeProvider';

/**
 * Lightweight stub for pages we'll build in later rounds.
 * Keeps routing fully functional so the scaffold can be tested end-to-end.
 */
const PlaceholderPage = ({ title, back = false, description }) => {
  const { colors, typography } = useTheme();
  return (
    <Box>
      <TopBar title={title} back={back} />
      <Box sx={{ p: 3, textAlign: 'center', mt: 6 }}>
        <Typography
          sx={{
            fontFamily: typography.fontDisplay,
            fontSize: 22,
            color: colors.primary,
            mb: 1,
          }}
        >
          {title}
        </Typography>
        <Typography sx={{ color: colors.textSecondary, fontSize: 14, lineHeight: 1.6, maxWidth: 320, mx: 'auto' }}>
          {description ?? 'This module is part of the scaffold — full implementation comes in a later round.'}
        </Typography>
      </Box>
    </Box>
  );
};

export default PlaceholderPage;
