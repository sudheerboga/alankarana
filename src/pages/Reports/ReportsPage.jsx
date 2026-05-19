import { useState, useMemo } from 'react';
import {
  Box, Card, Typography, Stack, Menu, MenuItem, Divider, LinearProgress, Tabs, Tab, Chip,
} from '@mui/material';
import { TuneRounded, TrendingUpRounded, TrendingDownRounded } from '@mui/icons-material';
import TopBar from '../../components/layout/TopBar';
import BarChart from '../../components/common/BarChart';
import EmptyState from '../../components/common/EmptyState';
import { useCollection } from '../../hooks/useCollection';
import { useTheme } from '../../theme/ThemeProvider';
import { formatINR } from '../../utils/format';
import { getDateRange, DATE_RANGE_OPTIONS } from '../../utils/dateRange';
import {
  aggregateSales, groupSalesByBucket, topCategoriesByRevenue,
  bestSellingItems, expensesByType, netProfitLoss,
} from '../../utils/reports';
import { useSelector } from 'react-redux';
import { selectCategories } from '../../store/slices/categoriesSlice';
import { COLLECTIONS, EXPENSE_TYPES } from '../../constants';

const TYPE_NAMES = Object.fromEntries(EXPENSE_TYPES.map((t) => [t.id, t.name]));

const StatBlock = ({ label, value, accent }) => {
  const { colors } = useTheme();
  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: 11, color: colors.textMuted, letterSpacing: '0.04em', fontWeight: 500, mb: 0.5 }}>
        {label}
      </Typography>
      <Typography sx={{
        fontSize: 20,
        fontWeight: 700,
        color: accent ? colors.primary : colors.text,
        letterSpacing: '-0.02em',
        lineHeight: 1.1,
      }}>
        {value}
      </Typography>
    </Box>
  );
};

const ReportsPage = () => {
  const { colors } = useTheme();
  const [rangeKey, setRangeKey] = useState('month');
  const [tab, setTab] = useState(0);
  const [filterAnchor, setFilterAnchor] = useState(null);
  const categories = useSelector(selectCategories);

  const range = useMemo(() => getDateRange(rangeKey), [rangeKey]);

  const salesSpec = useMemo(() => {
    const spec = { orderBy: [['soldAt', 'desc']] };
    if (range) spec.where = [['soldAt', '>=', range.start], ['soldAt', '<=', range.end]];
    return spec;
  }, [range]);

  const expensesSpec = useMemo(() => {
    const spec = { orderBy: [['date', 'desc']] };
    if (range) spec.where = [['date', '>=', range.start], ['date', '<=', range.end]];
    return spec;
  }, [range]);

  const { items: sales, loading: salesLoading } = useCollection(COLLECTIONS.SALES, salesSpec);
  const { items: expenses, loading: expensesLoading } = useCollection(COLLECTIONS.EXPENSES, expensesSpec);
  const { items: inventory } = useCollection(COLLECTIONS.INVENTORY, {});

  const salesSummary = useMemo(() => aggregateSales(sales), [sales]);
  const expenseTotal = useMemo(() => expenses.reduce((s, e) => s + (e.amount || 0), 0), [expenses]);
  const pl = useMemo(() => netProfitLoss(sales, expenses), [sales, expenses]);

  const bucket = ['today', 'yesterday', 'week'].includes(rangeKey) ? 'day' : rangeKey === 'year' ? 'month' : 'day';
  const chartData = useMemo(
    () => groupSalesByBucket(sales, bucket).map((b) => ({ label: b.label, value: b.revenue })),
    [sales, bucket]
  );

  const topCats = useMemo(() => topCategoriesByRevenue(sales, 5), [sales]);
  const topItems = useMemo(() => bestSellingItems(sales, 5), [sales]);
  const expBreak = useMemo(() => expensesByType(expenses), [expenses]);

  const categoryNameMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  const inventoryStats = useMemo(() => {
    const totalValue = inventory.reduce((s, i) => s + (i.remainingPieces || 0) * (i.costPerPiece || 0), 0);
    const low = inventory.filter((i) => (i.remainingPieces ?? 0) > 0 && (i.remainingPieces ?? 0) <= 3).length;
    const out = inventory.filter((i) => (i.remainingPieces ?? 0) <= 0).length;
    return { count: inventory.length, totalValue, low, out };
  }, [inventory]);

  const rangeLabel = DATE_RANGE_OPTIONS.find((o) => o.value === rangeKey)?.label || rangeKey;
  const loading = salesLoading || expensesLoading;
  const netPositive = pl.net >= 0;

  return (
    <Box sx={{ pb: 10 }}>
      <TopBar
        title="Reports"
        actions={
          <Chip
            label={rangeLabel}
            onClick={(e) => setFilterAnchor(e.currentTarget)}
            onDelete={(e) => setFilterAnchor(e.currentTarget)}
            deleteIcon={<TuneRounded sx={{ fontSize: 16 }} />}
            sx={{
              height: 32,
              backgroundColor: colors.surface,
              border: `1px solid ${colors.border}`,
              fontWeight: 500,
              color: colors.text,
              '& .MuiChip-deleteIcon': { color: colors.textMuted, marginRight: '8px' },
            }}
          />
        }
      />
      <Menu anchorEl={filterAnchor} open={!!filterAnchor} onClose={() => setFilterAnchor(null)}>
        {DATE_RANGE_OPTIONS.map((opt) => (
          <MenuItem
            key={opt.value}
            selected={rangeKey === opt.value}
            onClick={() => { setRangeKey(opt.value); setFilterAnchor(null); }}
          >
            {opt.label}
          </MenuItem>
        ))}
      </Menu>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="fullWidth"
        sx={{ borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.bg, mx: 0 }}
      >
        <Tab label="Overview" />
        <Tab label="Sales" />
        <Tab label="Expenses" />
        <Tab label="Inventory" />
      </Tabs>

      {loading && <LinearProgress sx={{ height: 2 }} />}

      {/* OVERVIEW */}
      {tab === 0 && (
        <Box sx={{ p: 2 }}>
          <Stack spacing={2}>
            {/* Net P&L — clean number, no gradient */}
            <Box sx={{ py: 1 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: colors.textMuted, letterSpacing: '0.02em', mb: 0.5 }}>
                NET PROFIT
              </Typography>
              <Typography sx={{
                fontSize: 44,
                fontWeight: 800,
                color: netPositive ? colors.text : colors.danger,
                letterSpacing: '-0.04em',
                lineHeight: 1,
                mb: 1.5,
              }}>
                {netPositive ? '+' : ''}{formatINR(pl.net)}
              </Typography>
              <Chip
                size="small"
                icon={netPositive ? <TrendingUpRounded sx={{ fontSize: 14 }} /> : <TrendingDownRounded sx={{ fontSize: 14 }} />}
                label={`Profit ${formatINR(pl.saleProfit)} − Expenses ${formatINR(pl.totalExpense)}`}
                sx={{
                  backgroundColor: colors.surfaceAlt,
                  color: colors.textSecondary,
                  fontWeight: 500,
                  fontSize: 11,
                  height: 24,
                  '& .MuiChip-icon': { color: 'inherit' },
                }}
              />
            </Box>

            <Card sx={{ p: 2 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, letterSpacing: '0.05em', mb: 2 }}>
                REVENUE TREND
              </Typography>
              <BarChart data={chartData} />
            </Card>

            <Card sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <StatBlock label="SALES" value={salesSummary.count} />
                <StatBlock label="REVENUE" value={formatINR(salesSummary.revenue, { compact: true })} accent />
                <StatBlock label="MARGIN" value={`${salesSummary.margin.toFixed(1)}%`} />
              </Box>
            </Card>
          </Stack>
        </Box>
      )}

      {/* SALES */}
      {tab === 1 && (
        <Box sx={{ p: 2 }}>
          {sales.length === 0 ? (
            <EmptyState title="No sales in this period" description="Try a wider date range." />
          ) : (
            <Stack spacing={2}>
              <Card sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <StatBlock label="REVENUE" value={formatINR(salesSummary.revenue, { compact: true })} accent />
                  <StatBlock label="PROFIT" value={formatINR(salesSummary.profit, { compact: true })} />
                  <StatBlock label="AVG SALE" value={formatINR(salesSummary.avgSale, { compact: true })} />
                </Box>
              </Card>

              <Card sx={{ p: 2 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, letterSpacing: '0.05em', mb: 2 }}>
                  TOP CATEGORIES
                </Typography>
                <Stack spacing={1.5}>
                  {topCats.map((c) => {
                    const pct = salesSummary.revenue > 0 ? (c.revenue / salesSummary.revenue) * 100 : 0;
                    return (
                      <Box key={c.category}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography sx={{ fontSize: 13, color: colors.text }}>
                            {categoryNameMap[c.category] || c.category}
                          </Typography>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.text }}>
                            {formatINR(c.revenue)}
                          </Typography>
                        </Box>
                        <Box sx={{ height: 4, backgroundColor: colors.surfaceAlt, borderRadius: 2, overflow: 'hidden' }}>
                          <Box sx={{ width: `${pct}%`, height: '100%', backgroundColor: colors.primary, transition: 'width 0.3s ease' }} />
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Card>

              <Card sx={{ p: 2 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, letterSpacing: '0.05em', mb: 1.5 }}>
                  BEST SELLERS
                </Typography>
                <Stack divider={<Divider sx={{ borderColor: colors.border }} />}>
                  {topItems.map((it, idx) => (
                    <Box key={it.itemId} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.25, alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', minWidth: 0, flex: 1 }}>
                        <Box sx={{
                          width: 22, height: 22, borderRadius: '50%',
                          backgroundColor: idx === 0 ? colors.text : colors.surfaceAlt,
                          color: idx === 0 ? colors.textInverse : colors.textSecondary,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 700,
                          flexShrink: 0,
                        }}>
                          {idx + 1}
                        </Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 500, color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {it.itemName}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.text }}>
                          {it.quantity} sold
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: colors.success }}>
                          +{formatINR(it.profit)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Card>
            </Stack>
          )}
        </Box>
      )}

      {/* EXPENSES */}
      {tab === 2 && (
        <Box sx={{ p: 2 }}>
          {expenses.length === 0 ? (
            <EmptyState title="No expenses in this period" />
          ) : (
            <Stack spacing={2}>
              <Card sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <StatBlock label="TOTAL" value={formatINR(expenseTotal, { compact: true })} accent />
                  <StatBlock label="ENTRIES" value={expenses.length} />
                  <StatBlock label="BULK" value={expenses.filter((e) => e.isBulkPurchase).length} />
                </Box>
              </Card>

              <Card sx={{ p: 2 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, letterSpacing: '0.05em', mb: 2 }}>
                  BY CATEGORY
                </Typography>
                <Stack spacing={1.5}>
                  {expBreak.map((e) => {
                    const pct = expenseTotal > 0 ? (e.amount / expenseTotal) * 100 : 0;
                    return (
                      <Box key={e.type}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography sx={{ fontSize: 13, color: colors.text }}>
                            {TYPE_NAMES[e.type] || e.type}
                          </Typography>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.text }}>
                            {formatINR(e.amount)} <Typography component="span" sx={{ fontSize: 11, color: colors.textMuted }}>({pct.toFixed(0)}%)</Typography>
                          </Typography>
                        </Box>
                        <Box sx={{ height: 4, backgroundColor: colors.surfaceAlt, borderRadius: 2, overflow: 'hidden' }}>
                          <Box sx={{ width: `${pct}%`, height: '100%', backgroundColor: colors.accent }} />
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </Card>
            </Stack>
          )}
        </Box>
      )}

      {/* INVENTORY */}
      {tab === 3 && (
        <Box sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Card sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <StatBlock label="ITEMS" value={inventoryStats.count} />
                <StatBlock label="STOCK VALUE" value={formatINR(inventoryStats.totalValue, { compact: true })} accent />
              </Box>
              <Divider sx={{ my: 2, borderColor: colors.border }} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <StatBlock label="LOW STOCK" value={inventoryStats.low} />
                <StatBlock label="OUT OF STOCK" value={inventoryStats.out} />
              </Box>
            </Card>

            <Card sx={{ p: 2 }}>
              <Typography sx={{ fontSize: 13, color: colors.textSecondary, lineHeight: 1.6 }}>
                Inventory metrics show current snapshot — not filtered by date range above.
              </Typography>
            </Card>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default ReportsPage;
