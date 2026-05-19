import { Box, Typography, Button } from '@mui/material';
import { Inventory2Outlined } from '@mui/icons-material';
import { useTheme } from '../../theme/ThemeProvider';

const EmptyState = ({
  icon: Icon = Inventory2Outlined,
  title = 'Nothing here yet',
  description,
  actionLabel,
  onAction,
}) => {
  const { colors, typography } = useTheme();
  return (
    <Box
      sx={{
        py: 8, px: 3,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <Box
        sx={{
          width: 72, height: 72,
          borderRadius: '50%',
          backgroundColor: colors.surfaceAlt,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: colors.textMuted,
        }}
      >
        <Icon sx={{ fontSize: 36 }} />
      </Box>
      <Typography
        sx={{
          fontFamily: typography.fontDisplay,
          fontSize: 20,
          color: colors.text,
          mt: 0.5,
        }}
      >
        {title}
      </Typography>
      {description && (
        <Typography sx={{ fontSize: 14, color: colors.textSecondary, maxWidth: 280, lineHeight: 1.6 }}>
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button variant="contained" onClick={onAction} sx={{ mt: 1.5 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;
