import { useMemo } from 'react';
import { Box, Card, Typography, Stack, Button, Chip, Avatar } from '@mui/material';
import {
  TrendingUpRounded, TrendingDownRounded,
  PointOfSaleRounded, AddBoxRounded, WarningAmberRounded,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import TopBar from '../../components/layout/TopBar';
import { useCollection } from '../../hooks/useCollection';
import { useTheme } from '../../theme/ThemeProvider';
import { formatINR, getStockStatus } from '../../utils/format';
import { getDateRange } from '../../utils/dateRange';
import { aggregateSales } from '../../utils/reports';
import { summarizeInventory } from '../../utils/inventoryFilters';
import { selectUser } from '../../store/slices/authSlice';
import { COLLECTIONS, ROUTES, STOCK_STATUS } from '../../constants';

const initials = (n) => (n || '?').trim().split(/\s+/).map((s) => s[0]).slice(0, 2).join('').toUpperCase();

/* ── Compact stat tile ── */
const StatTile = ({ label, value, onClick }) => {
  const { colors } = useTheme();
  return (
    <Box
      onClick={onClick}
      sx={{
        flex: 1,
        textAlign: 'center',
        cursor: onClick ? 'pointer' : 'default',
        py: 1.5,
        '&:active': onClick ? { opacity: 0.7 } : {},
      }}
    >
      <Typography sx={{ fontSize: 11, fontWeight: 500, color: colors.textMuted, letterSpacing: '0.04em', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 20, fontWeight: 700, color: colors.text, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
        {value}
      </Typography>
    </Box>
  );
};

/* ── Page ── */
const DashboardPage = () => {
  const navigate = useNavigate();
  const { colors, typography } = useTheme();
  const user = useSelector(selectUser);

  const todayRange = useMemo(() => getDateRange('today'), []);

  const todaySpec = useMemo(() => ({
    orderBy: [['soldAt', 'desc']],
    where: [['soldAt', '>=', todayRange.start], ['soldAt', '<=', todayRange.end]],
  }), [todayRange]);

  const { items: todaySales } = useCollection(COLLECTIONS.SALES, todaySpec);
  const { items: inventory } = useCollection(COLLECTIONS.INVENTORY, { orderBy: [['createdAt', 'desc']] });

  const todayStats = useMemo(() => aggregateSales(todaySales), [todaySales]);
  const invSummary = useMemo(() => summarizeInventory(inventory), [inventory]);

  const lowStockCount = useMemo(
    () => inventory.filter((i) => {
      const s = getStockStatus(i.remainingPieces ?? 0);
      return s === STOCK_STATUS.LOW || s === STOCK_STATUS.OUT;
    }).length,
    [inventory]
  );

  const profitPositive = todayStats.profit >= 0;
  const displayName = (user?.displayName || user?.phoneNumber || user?.email || 'there').split(/\s+/)[0];

  return (
    <Box>
      <TopBar
        title="Alankarana"
        // actions={
        //   <Avatar
        //     onClick={() => navigate(ROUTES.SETTINGS)}
        //     sx={{
        //       width: 36, height: 36,
        //       bgcolor: colors.surfaceAlt,
        //       color: colors.text,
        //       fontSize: 13,
        //       fontWeight: 600,
        //       cursor: 'pointer',
        //       border: `1px solid ${colors.border}`,
        //     }}
        //   >
        //     {initials(displayName)}
        //   </Avatar>
        // }
      />

      <Box sx={{ px: 2, pb: 12 }}>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>

          {/* ── Revenue hero ── */}
          <Box sx={{ mt: 3, mb: 2.5 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: colors.textMuted, letterSpacing: '0.04em', mb: 1 }}>
              TODAY'S REVENUE
            </Typography>
            <Typography
              sx={{
                fontSize: 52,
                fontWeight: 800,
                letterSpacing: '-0.04em',
                color: colors.text,
                lineHeight: 1,
                mb: 1.5,
                fontFamily: typography.fontDisplay,
              }}
            >
              {formatINR(todayStats.revenue)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Chip
                size="small"
                icon={profitPositive
                  ? <TrendingUpRounded sx={{ fontSize: 14 }} />
                  : <TrendingDownRounded sx={{ fontSize: 14 }} />}
                label={`${profitPositive ? '+' : ''}${formatINR(todayStats.profit)} profit`}
                sx={{
                  height: 26,
                  backgroundColor: profitPositive ? colors.successBg : colors.dangerBg,
                  color: profitPositive ? colors.success : colors.danger,
                  fontWeight: 600,
                  fontSize: 12,
                  '& .MuiChip-icon': { color: 'inherit' },
                }}
              />
              <Typography sx={{ fontSize: 12, color: colors.textMuted }}>
                {todayStats.count} {todayStats.count === 1 ? 'sale' : 'sales'} today
              </Typography>
            </Box>
          </Box>

          {/* ── Inventory stats ── */}
          <Card
            sx={{ mb: 2.5, overflow: 'hidden', cursor: 'pointer' }}
            onClick={() => navigate(ROUTES.ITEMS)}
          >
            <Box sx={{ display: 'flex', divideX: 1 }}>
              <StatTile
                label="ITEMS"
                value={invSummary.itemCount}
              />
              <Box sx={{ width: '1px', backgroundColor: colors.border, my: 1 }} />
              <StatTile
                label="IN STOCK"
                value={invSummary.totalUnits}
              />
              <Box sx={{ width: '1px', backgroundColor: colors.border, my: 1 }} />
              <StatTile
                label="STOCK VALUE"
                value={formatINR(invSummary.totalValue, { compact: true })}
              />
            </Box>
          </Card>

          {/* ── Primary actions ── */}
          <Stack spacing={1.5} sx={{ mb: 2.5 }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<PointOfSaleRounded />}
              onClick={() => navigate(ROUTES.SALE_NEW)}
              sx={{
                py: 1.75,
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                boxShadow: `0 4px 16px ${colors.primary}30`,
              }}
            >
              Record a Sale
            </Button>

            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<AddBoxRounded />}
              onClick={() => navigate(ROUTES.ITEM_NEW)}
              sx={{
                py: 1.75,
                fontSize: 15,
                fontWeight: 600,
                borderColor: colors.border,
                color: colors.text,
                backgroundColor: colors.surface,
                '&:hover': { backgroundColor: colors.surfaceAlt, borderColor: colors.borderStrong },
              }}
            >
              Add Item
            </Button>
          </Stack>

          {/* ── Low stock alert — compact single line ── */}
          {lowStockCount > 0 && (
            <Box
              onClick={() => navigate(ROUTES.ITEMS)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1.5,
                borderRadius: 2,
                backgroundColor: colors.warningBg,
                cursor: 'pointer',
                '&:active': { opacity: 0.75 },
              }}
            >
              <WarningAmberRounded sx={{ fontSize: 18, color: colors.warning, flexShrink: 0 }} />
              <Typography sx={{ flex: 1, fontSize: 13, fontWeight: 500, color: colors.warning }}>
                {lowStockCount} {lowStockCount === 1 ? 'item needs' : 'items need'} restocking
              </Typography>
              <Typography sx={{ fontSize: 12, color: colors.warning, opacity: 0.7 }}>View →</Typography>
            </Box>
          )}

        </motion.div>
      </Box>
    </Box>
  );
};

export default DashboardPage;
