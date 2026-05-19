import { Box, Typography, Card, CardContent, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import TopBar from '../../components/layout/TopBar';
import UserMenu from '../../components/layout/UserMenu';
import { useTheme } from '../../theme/ThemeProvider';
import { formatINR } from '../../utils/format';

const StatCard = ({ label, value, accent = false }) => {
  const { colors, typography } = useTheme();
  return (
    <Card
      sx={{
        background: accent
          ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryHover} 100%)`
          : colors.surface,
        color: accent ? colors.textInverse : colors.text,
        border: accent ? 'none' : `1px solid ${colors.border}`,
        height: '100%',
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Typography
          sx={{
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: accent ? 'rgba(255,255,255,0.85)' : colors.textMuted,
            mb: 0.5,
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontFamily: typography.fontDisplay,
            fontSize: 24,
            fontWeight: 600,
          }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

const DashboardPage = () => {
  const { colors, typography } = useTheme();

  return (
    <Box>
      <TopBar title="Alankarana" actions={<UserMenu />} />
      <Box sx={{ p: 2 }}>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Typography
            sx={{
              fontFamily: typography.fontDisplay,
              fontSize: 14,
              color: colors.textSecondary,
              mb: 0.5,
              letterSpacing: '0.05em',
            }}
          >
            Welcome back
          </Typography>
          <Typography sx={{ fontSize: 22, fontWeight: 600, color: colors.text, mb: 3 }}>
            Here's today
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 1.5,
              mb: 3,
            }}
          >
            <StatCard label="Today's Sales" value={formatINR(0)} accent />
            <StatCard label="Profit" value={formatINR(0)} />
            <StatCard label="Stock Value" value={formatINR(0)} />
            <StatCard label="Expenses" value={formatINR(0)} />
          </Box>

          <Card sx={{ p: 2 }}>
            <Typography sx={{ fontWeight: 600, color: colors.text, mb: 1 }}>
              Quick start
            </Typography>
            <Typography sx={{ fontSize: 14, color: colors.textSecondary, lineHeight: 1.6 }}>
              The dashboard will show recent sales, best sellers, old stock,
              and low-stock alerts here. We'll wire it up once inventory and
              sales modules are in.
            </Typography>
          </Card>
        </motion.div>
      </Box>
    </Box>
  );
};

export default DashboardPage;
