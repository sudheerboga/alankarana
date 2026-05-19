import { useState, useMemo } from 'react';
import { Box, Stack, Typography, Card, Menu, MenuItem, IconButton, Chip } from '@mui/material';
import { PointOfSaleOutlined, MoreVertRounded, AddRounded, TuneRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import TopBar from '../../components/layout/TopBar';
import FAB from '../../components/common/FAB';
import EmptyState from '../../components/common/EmptyState';
import SaleCard from '../../modules/sales/SaleCard';
import { useCollection } from '../../hooks/useCollection';
import { useMutation } from '../../hooks/useMutation';
import { reverseSale } from '../../services/salesService';
import { openConfirm } from '../../store/slices/uiSlice';
import { useTheme } from '../../theme/ThemeProvider';
import { formatINR } from '../../utils/format';
import { getDateRange, DATE_RANGE_OPTIONS } from '../../utils/dateRange';
import { COLLECTIONS, ROUTES } from '../../constants';

const SalesListPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const [rangeKey, setRangeKey] = useState('today');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [actionSale, setActionSale] = useState(null);
  const [filterAnchor, setFilterAnchor] = useState(null);

  const querySpec = useMemo(() => {
    const range = getDateRange(rangeKey);
    const spec = { orderBy: [['soldAt', 'desc']] };
    if (range) {
      spec.where = [['soldAt', '>=', range.start], ['soldAt', '<=', range.end]];
    }
    return spec;
  }, [rangeKey]);

  const { items: sales, loading } = useCollection(COLLECTIONS.SALES, querySpec);

  const summary = useMemo(() => sales.reduce(
    (acc, s) => {
      acc.revenue += s.totalSaleAmount || 0;
      acc.profit += s.profit || 0;
      acc.count += 1;
      return acc;
    },
    { revenue: 0, profit: 0, count: 0 }
  ), [sales]);

  const reverse = useMutation(reverseSale, {
    successMessage: 'Sale reversed, stock restored',
    errorMessage: 'Could not reverse sale',
  });

  const handleDelete = (sale) => {
    setMenuAnchor(null);
    dispatch(openConfirm({
      title: 'Reverse this sale?',
      message: `${sale.itemName}\nQty: ${sale.quantity} · ${formatINR(sale.totalSaleAmount)}\n\nStock will be restored.`,
      confirmLabel: 'Reverse',
      severity: 'danger',
      onConfirm: () => reverse.run(sale.id),
    }));
  };

  const rangeLabel = DATE_RANGE_OPTIONS.find((o) => o.value === rangeKey)?.label;

  return (
    <Box sx={{ pb: 10 }}>
      <TopBar
        title="Sales"
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

      <Box sx={{ px: 2 }}>
        {/* Summary — big number, minimal */}
        <Box sx={{ py: 2, mb: 1 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: colors.textMuted, letterSpacing: '0.02em', mb: 0.5 }}>
            {rangeLabel.toUpperCase()}
          </Typography>
          <Typography sx={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.04em', color: colors.text, lineHeight: 1, mb: 1 }}>
            {formatINR(summary.revenue)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography sx={{ fontSize: 13, color: colors.textSecondary }}>
              {summary.count} {summary.count === 1 ? 'sale' : 'sales'}
            </Typography>
            <Box sx={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: colors.textMuted }} />
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: summary.profit >= 0 ? colors.success : colors.danger }}>
              {summary.profit >= 0 ? '+' : ''}{formatINR(summary.profit)} profit
            </Typography>
          </Box>
        </Box>

        {/* Sales list */}
        {loading && sales.length === 0 ? (
          <Stack spacing={1.5}>
            {[1, 2, 3].map((i) => <Card key={i} sx={{ height: 90, opacity: 0.4 }} />)}
          </Stack>
        ) : sales.length === 0 ? (
          <EmptyState
            icon={PointOfSaleOutlined}
            title="No sales yet"
            description={`Record your first sale for ${rangeLabel.toLowerCase()}.`}
            actionLabel="New Sale"
            onAction={() => navigate(ROUTES.SALE_NEW)}
          />
        ) : (
          <Stack spacing={1.5}>
            {sales.map((sale, idx) => (
              <SaleCard
                key={sale.id}
                sale={sale}
                index={idx}
                menuButton={
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); setMenuAnchor(e.currentTarget); setActionSale(sale); }}
                    sx={{ color: colors.textMuted, width: 28, height: 28, ml: 0.5 }}
                  >
                    <MoreVertRounded fontSize="small" />
                  </IconButton>
                }
              />
            ))}
          </Stack>
        )}
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={!!menuAnchor}
        onClose={() => { setMenuAnchor(null); setActionSale(null); }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleDelete(actionSale)} sx={{ color: colors.danger }}>
          Reverse sale
        </MenuItem>
      </Menu>

      <FAB icon={<AddRounded />} label="New Sale" onClick={() => navigate(ROUTES.SALE_NEW)} />
    </Box>
  );
};

export default SalesListPage;
