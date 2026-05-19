import { useState, useMemo } from 'react';
import { Box, Stack, Typography, Card, IconButton, Menu, MenuItem, Chip } from '@mui/material';
import {
  ReceiptLongOutlined, AddRounded, TuneRounded, MoreVertRounded,
  LocalGasStationOutlined, RestaurantOutlined, FlightOutlined, CheckroomOutlined, DiamondOutlined, MoreHorizOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import TopBar from '../../components/layout/TopBar';
import FAB from '../../components/common/FAB';
import EmptyState from '../../components/common/EmptyState';
import { useCollection } from '../../hooks/useCollection';
import { useMutation } from '../../hooks/useMutation';
import { deleteExpense } from '../../services/expenseService';
import { openConfirm } from '../../store/slices/uiSlice';
import { useTheme } from '../../theme/ThemeProvider';
import { formatINR, formatDate } from '../../utils/format';
import { getDateRange, DATE_RANGE_OPTIONS } from '../../utils/dateRange';
import { COLLECTIONS, ROUTES, EXPENSE_TYPES } from '../../constants';

const TYPE_ICONS = {
  fuel: LocalGasStationOutlined,
  food: RestaurantOutlined,
  travel: FlightOutlined,
  'textile-purchase': CheckroomOutlined,
  'jewellery-purchase': DiamondOutlined,
  misc: MoreHorizOutlined,
};

const TYPE_NAMES = Object.fromEntries(EXPENSE_TYPES.map((t) => [t.id, t.name]));

const ExpenseRow = ({ expense, onMenu, index }) => {
  const { colors } = useTheme();
  const Icon = TYPE_ICONS[expense.type] || MoreHorizOutlined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.2) }}
    >
      <Card sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Box
            sx={{
              width: 40, height: 40, borderRadius: 2,
              backgroundColor: colors.surfaceAlt,
              color: colors.textSecondary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon sx={{ fontSize: 20 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.text, letterSpacing: '-0.01em' }}>
                {TYPE_NAMES[expense.type] || expense.type}
              </Typography>
              {expense.isBulkPurchase && (
                <Chip
                  size="small"
                  label="Bulk"
                  sx={{ height: 18, fontSize: 10, backgroundColor: colors.accentLight, color: colors.accent, fontWeight: 600 }}
                />
              )}
            </Box>
            <Typography sx={{ fontSize: 12, color: colors.textMuted, mt: 0.25 }}>
              {expense.vendorName ? `${expense.vendorName} · ` : ''}{formatDate(expense.date, 'DD MMM YYYY')}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: colors.text, letterSpacing: '-0.02em' }}>
            {formatINR(expense.amount)}
          </Typography>
          <IconButton size="small" onClick={(e) => onMenu(e.currentTarget, expense)} sx={{ color: colors.textMuted, width: 32, height: 32 }}>
            <MoreVertRounded fontSize="small" />
          </IconButton>
        </Box>
      </Card>
    </motion.div>
  );
};

const ExpensesListPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const [rangeKey, setRangeKey] = useState('month');
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [actionExpense, setActionExpense] = useState(null);

  const querySpec = useMemo(() => {
    const range = getDateRange(rangeKey);
    const spec = { orderBy: [['date', 'desc']] };
    if (range) spec.where = [['date', '>=', range.start], ['date', '<=', range.end]];
    return spec;
  }, [rangeKey]);

  const { items: expenses, loading } = useCollection(COLLECTIONS.EXPENSES, querySpec);

  const summary = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const byType = {};
    expenses.forEach((e) => { byType[e.type] = (byType[e.type] || 0) + (e.amount || 0); });
    return { total, byType, count: expenses.length };
  }, [expenses]);

  const remove = useMutation(deleteExpense, {
    successMessage: 'Expense deleted',
    errorMessage: 'Could not delete',
  });

  const handleDelete = (expense) => {
    setMenuAnchor(null);
    dispatch(openConfirm({
      title: 'Delete this expense?',
      message: `${TYPE_NAMES[expense.type]} · ${formatINR(expense.amount)}`,
      confirmLabel: 'Delete',
      severity: 'danger',
      onConfirm: () => remove.run(expense.id),
    }));
  };

  const rangeLabel = DATE_RANGE_OPTIONS.find((o) => o.value === rangeKey)?.label;
  const topCategories = Object.entries(summary.byType).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <Box sx={{ pb: 10 }}>
      <TopBar
        title="Expenses"
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
        {/* Summary */}
        <Box sx={{ py: 2, mb: 1 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 500, color: colors.textMuted, letterSpacing: '0.02em', mb: 0.5 }}>
            {rangeLabel.toUpperCase()}
          </Typography>
          <Typography sx={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.04em', color: colors.text, lineHeight: 1, mb: 1 }}>
            {formatINR(summary.total)}
          </Typography>
          <Typography sx={{ fontSize: 13, color: colors.textSecondary }}>
            {summary.count} {summary.count === 1 ? 'entry' : 'entries'}
          </Typography>
        </Box>

        {/* Top categories card */}
        {topCategories.length > 0 && (
          <Card sx={{ p: 2, mb: 2 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, letterSpacing: '0.05em', mb: 1.5 }}>
              TOP CATEGORIES
            </Typography>
            <Stack spacing={1}>
              {topCategories.map(([type, amount]) => (
                <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: 13, color: colors.text }}>{TYPE_NAMES[type] || type}</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.text }}>{formatINR(amount)}</Typography>
                </Box>
              ))}
            </Stack>
          </Card>
        )}

        {/* List */}
        {loading && expenses.length === 0 ? (
          <Stack spacing={1.5}>
            {[1, 2, 3].map((i) => <Card key={i} sx={{ height: 76, opacity: 0.4 }} />)}
          </Stack>
        ) : expenses.length === 0 ? (
          <EmptyState
            icon={ReceiptLongOutlined}
            title="No expenses yet"
            description={`Track expenses for ${rangeLabel.toLowerCase()}.`}
            actionLabel="Add Expense"
            onAction={() => navigate(ROUTES.EXPENSE_NEW)}
          />
        ) : (
          <Stack spacing={1.5}>
            {expenses.map((e, idx) => (
              <ExpenseRow
                key={e.id}
                expense={e}
                index={idx}
                onMenu={(anchor, exp) => { setMenuAnchor(anchor); setActionExpense(exp); }}
              />
            ))}
          </Stack>
        )}
      </Box>

      <Menu anchorEl={menuAnchor} open={!!menuAnchor} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => handleDelete(actionExpense)} sx={{ color: colors.danger }}>
          Delete expense
        </MenuItem>
      </Menu>

      <FAB icon={<AddRounded />} label="Add Expense" onClick={() => navigate(ROUTES.EXPENSE_NEW)} />
    </Box>
  );
};

export default ExpensesListPage;
