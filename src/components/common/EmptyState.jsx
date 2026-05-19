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
          width: 56, height: 56,
          borderRadius: 3,
          backgroundColor: colors.surfaceAlt,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: colors.textSecondary,
        }}
      >
        <Icon sx={{ fontSize: 28 }} />
      </Box>
      <Typography
        sx={{
          fontSize: 17,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: colors.text,
          mt: 0.5,
        }}
      >
        {title}
      </Typography>
      {description && (
        <Typography sx={{ fontSize: 14, color: colors.textSecondary, maxWidth: 300, lineHeight: 1.55 }}>
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
