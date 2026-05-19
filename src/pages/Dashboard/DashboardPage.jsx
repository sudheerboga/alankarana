import { useMemo } from 'react';
import { Box, Card, Typography, Stack, Button, Chip, Divider, Avatar } from '@mui/material';
import {
  TrendingUpRounded, TrendingDownRounded, ChevronRightRounded,
  ArrowOutwardRounded,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import TopBar from '../../components/layout/TopBar';
import { useCollection } from '../../hooks/useCollection';
import { useTheme } from '../../theme/ThemeProvider';
import { formatINR, formatRelative, getStockStatus } from '../../utils/format';
import { getDateRange } from '../../utils/dateRange';
import { aggregateSales, bestSellingItems } from '../../utils/reports';
import { summarizeInventory } from '../../utils/inventoryFilters';
import { selectUser } from '../../store/slices/authSlice';
import { COLLECTIONS, ROUTES, REQUEST_STATUS, STOCK_STATUS } from '../../constants';

const initials = (n) => (n || '?').trim().split(/\s+/).map((s) => s[0]).slice(0, 2).join('').toUpperCase();

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const StatTile = ({ label, value, sublabel, onClick, accent }) => {
  const { colors } = useTheme();
  return (
    <Card
      onClick={onClick}
      sx={{
        p: 2,
        cursor: onClick ? 'pointer' : 'default',
        height: '100%',
        backgroundColor: colors.surface,
        '&:active': onClick ? { transform: 'scale(0.99)' } : {},
        transition: 'all 0.18s ease',
      }}
    >
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 500,
          color: colors.textMuted,
          letterSpacing: '0.02em',
          mb: 1,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: 22,
          fontWeight: 700,
          color: accent ? colors.primary : colors.text,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
        }}
      >
        {value}
      </Typography>
      {sublabel && (
        <Typography sx={{ fontSize: 12, color: colors.textSecondary, mt: 0.5, letterSpacing: '-0.005em' }}>
          {sublabel}
        </Typography>
      )}
    </Card>
  );
};

const SectionHeader = ({ title, action, onActionClick }) => {
  const { colors } = useTheme();
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1.5, px: 0.5 }}>
      <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary, letterSpacing: '-0.005em' }}>
        {title}
      </Typography>
      {action && (
        <Typography
          onClick={onActionClick}
          sx={{
            fontSize: 12,
            fontWeight: 500,
            color: colors.primary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 0.25,
          }}
        >
          {action} <ChevronRightRounded sx={{ fontSize: 14 }} />
        </Typography>
      )}
    </Box>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const user = useSelector(selectUser);

  // Date ranges
  const todayRange = useMemo(() => getDateRange('today'), []);
  const monthRange = useMemo(() => getDateRange('month'), []);
  const weekRange = useMemo(() => getDateRange('week'), []);

  // Query specs
  const todaySpec = useMemo(() => ({
    orderBy: [['soldAt', 'desc']],
    where: [['soldAt', '>=', todayRange.start], ['soldAt', '<=', todayRange.end]],
  }), [todayRange]);

  const monthExpSpec = useMemo(() => ({
    orderBy: [['date', 'desc']],
    where: [['date', '>=', monthRange.start], ['date', '<=', monthRange.end]],
  }), [monthRange]);

  const weekSalesSpec = useMemo(() => ({
    orderBy: [['soldAt', 'desc']],
    where: [['soldAt', '>=', weekRange.start], ['soldAt', '<=', weekRange.end]],
  }), [weekRange]);

  const { items: todaySales } = useCollection(COLLECTIONS.SALES, todaySpec);
  const { items: weekSales } = useCollection(COLLECTIONS.SALES, weekSalesSpec);
  const { items: monthExpenses } = useCollection(COLLECTIONS.EXPENSES, monthExpSpec);
  const { items: inventory } = useCollection(COLLECTIONS.INVENTORY, { orderBy: [['createdAt', 'desc']] });
  const { items: requests } = useCollection(
    COLLECTIONS.REQUESTED_ITEMS,
    { where: [['status', '==', REQUEST_STATUS.PENDING]] }
  );

  const todayStats = useMemo(() => aggregateSales(todaySales), [todaySales]);
  const expenseTotal = useMemo(() => monthExpenses.reduce((s, e) => s + (e.amount || 0), 0), [monthExpenses]);
  const invSummary = useMemo(() => summarizeInventory(inventory), [inventory]);
  const bestThisWeek = useMemo(() => bestSellingItems(weekSales, 3), [weekSales]);

  const lowStockItems = useMemo(
    () => inventory.filter((i) => {
      const status = getStockStatus(i.remainingPieces ?? 0);
      return status === STOCK_STATUS.LOW || status === STOCK_STATUS.OUT;
    }).slice(0, 5),
    [inventory]
  );

  const recentSales = todaySales.slice(0, 3);
  const profitTrend = todayStats.profit >= 0;
  const displayName = (user?.displayName || user?.phoneNumber || user?.email || 'there').split(/\s+/)[0];

  return (
    <Box>
      <TopBar
        title="Alankarana"
        actions={
          <Avatar
            onClick={() => navigate(ROUTES.SETTINGS)}
            sx={{
              width: 36, height: 36,
              bgcolor: colors.surfaceAlt,
              color: colors.text,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              border: `1px solid ${colors.border}`,
            }}
          >
            {initials(displayName)}
          </Avatar>
        }
      />

      <Box sx={{ px: 2, pb: 4 }}>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          {/* Greeting */}
          {/* <Box sx={{ mb: 3, pt: 1 }}>
            <Typography sx={{ fontSize: 14, color: colors.textSecondary, fontWeight: 500 }}>
              {getGreeting()}, {displayName}
            </Typography>
            <Typography sx={{ fontSize: 13, color: colors.textMuted, mt: 0.5 }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Typography>
          </Box> */}

          {/* Hero: Today's revenue */}
          <Box sx={{ mt: 3, mb: 3 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 500, color: colors.textMuted, letterSpacing: '0.02em', mb: 1 }}>
              TODAY'S REVENUE
            </Typography>
            <Typography
              sx={{
                fontSize: 48,
                fontWeight: 800,
                letterSpacing: '-0.04em',
                color: colors.text,
                lineHeight: 1,
                mb: 1.5,
              }}
            >
              {formatINR(todayStats.revenue)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Chip
                size="small"
                icon={profitTrend ? <TrendingUpRounded sx={{ fontSize: 14 }} /> : <TrendingDownRounded sx={{ fontSize: 14 }} />}
                label={`${profitTrend ? '+' : ''}${formatINR(todayStats.profit)} profit`}
                sx={{
                  height: 26,
                  backgroundColor: profitTrend ? colors.successBg : colors.dangerBg,
                  color: profitTrend ? colors.success : colors.danger,
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

          {/* Stat grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, mb: 3 }}>
            <StatTile
              label="STOCK VALUE"
              value={formatINR(invSummary.totalValue, { compact: true })}
              sublabel={`${invSummary.itemCount} items`}
              onClick={() => navigate(ROUTES.ITEMS)}
            />
            <StatTile
              label="EXPENSES · 30D"
              value={formatINR(expenseTotal, { compact: true })}
              sublabel={`${monthExpenses.length} entries`}
              onClick={() => navigate(ROUTES.EXPENSES)}
            />
          </Box>

          {/* Low stock alert */}
          {lowStockItems.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <SectionHeader
                title={`${lowStockItems.length} ${lowStockItems.length === 1 ? 'item needs' : 'items need'} attention`}
                action="View all"
                onActionClick={() => navigate(ROUTES.ITEMS)}
              />
              <Card sx={{ p: 2 }}>
                <Stack divider={<Divider sx={{ borderColor: colors.border }} />}>
                  {lowStockItems.map((item) => {
                    const status = getStockStatus(item.remainingPieces ?? 0);
                    const isOut = status === STOCK_STATUS.OUT;
                    return (
                      <Box
                        key={item.id}
                        onClick={() => navigate(ROUTES.ITEM_DETAIL(item.id))}
                        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', py: 1.25, '&:active': { opacity: 0.7 } }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: 14, fontWeight: 500, color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.itemName}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: isOut ? colors.danger : colors.warning,
                            ml: 2,
                          }}
                        >
                          {isOut ? 'Out of stock' : `${item.remainingPieces} left`}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Card>
            </Box>
          )}

          {/* Recent sales */}
          {recentSales.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <SectionHeader
                title="Recent sales"
                action="All sales"
                onActionClick={() => navigate(ROUTES.SALES)}
              />
              <Card sx={{ p: 2 }}>
                <Stack divider={<Divider sx={{ borderColor: colors.border }} />}>
                  {recentSales.map((sale) => (
                    <Box key={sale.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.25 }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontSize: 14, fontWeight: 500, color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sale.itemName}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: colors.textMuted, mt: 0.25 }}>
                          qty {sale.quantity} · {formatRelative(sale.soldAt)}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.text, letterSpacing: '-0.01em' }}>
                        {formatINR(sale.totalSaleAmount)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Card>
            </Box>
          )}

          {/* Best sellers */}
          {bestThisWeek.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <SectionHeader
                title="Top sellers this week"
                action="Reports"
                onActionClick={() => navigate(ROUTES.REPORTS)}
              />
              <Card sx={{ p: 2 }}>
                <Stack spacing={1.5}>
                  {bestThisWeek.map((it, idx) => (
                    <Box key={it.itemId} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 24, height: 24, borderRadius: '50%',
                          backgroundColor: idx === 0 ? colors.text : colors.surfaceAlt,
                          color: idx === 0 ? colors.textInverse : colors.textSecondary,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </Box>
                      <Typography sx={{ flex: 1, fontSize: 14, fontWeight: 500, color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {it.itemName}
                      </Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary }}>
                        {it.quantity} sold
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Card>
            </Box>
          )}

          {/* Pending requests */}
          {requests.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <SectionHeader
                title={`${requests.length} pending ${requests.length === 1 ? 'request' : 'requests'}`}
                action="View"
                onActionClick={() => navigate(ROUTES.REQUESTS)}
              />
              <Card sx={{ p: 2 }}>
                <Stack spacing={1}>
                  {requests.slice(0, 3).map((r) => (
                    <Typography key={r.id} sx={{ fontSize: 13, color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.description}
                    </Typography>
                  ))}
                </Stack>
              </Card>
            </Box>
          )}

          {/* Empty state */}
          {todaySales.length === 0 && lowStockItems.length === 0 && (
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: colors.text, mb: 1, letterSpacing: '-0.02em' }}>
                Welcome to your boutique
              </Typography>
              <Typography sx={{ fontSize: 14, color: colors.textSecondary, lineHeight: 1.6, mb: 2 }}>
                Tap the + button below to record your first sale.
              </Typography>
              <Button variant="outlined" onClick={() => navigate(ROUTES.ITEMS)} endIcon={<ArrowOutwardRounded fontSize="small" />}>
                Browse Items
              </Button>
            </Card>
          )}
        </motion.div>
      </Box>
    </Box>
  );
};

export default DashboardPage;
