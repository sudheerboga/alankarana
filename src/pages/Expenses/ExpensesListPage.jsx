import { useState, useMemo } from 'react';
import {
  Box, Stack, Typography, Card, Chip, Drawer, Divider, IconButton, Button, Menu, MenuItem,
} from '@mui/material';
import {
  ReceiptLongOutlined, AddRounded, TuneRounded, CloseRounded,
  LocalGasStationOutlined, RestaurantOutlined, FlightOutlined, CheckroomOutlined, DiamondOutlined, MoreHorizOutlined,
  DeleteOutlineRounded,
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
import { COLLECTIONS, ROUTES, EXPENSE_TYPES, PAYMENT_TYPES } from '../../constants';

const TYPE_ICONS = {
  fuel: LocalGasStationOutlined,
  food: RestaurantOutlined,
  travel: FlightOutlined,
  'textile-purchase': CheckroomOutlined,
  'jewellery-purchase': DiamondOutlined,
  misc: MoreHorizOutlined,
};

const TYPE_NAMES = Object.fromEntries(EXPENSE_TYPES.map((t) => [t.id, t.name]));
const PAYMENT_NAMES = Object.fromEntries(PAYMENT_TYPES.map((t) => [t.id, t.name]));

/* ── Expense list card ── */
const ExpenseRow = ({ expense, onClick, index }) => {
  const { colors } = useTheme();
  const Icon = TYPE_ICONS[expense.type] || MoreHorizOutlined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.2) }}
    >
      <Card
        onClick={onClick}
        sx={{ p: 2, cursor: 'pointer', '&:active': { opacity: 0.8 }, transition: 'opacity 0.12s' }}
      >
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
        </Box>
      </Card>
    </motion.div>
  );
};

/* ── Expense detail bottom drawer ── */
const ExpenseDetailDrawer = ({ expense, open, onClose, onDelete }) => {
  const { colors, typography } = useTheme();
  if (!expense) return null;

  const Icon = TYPE_ICONS[expense.type] || MoreHorizOutlined;
  const billImg = expense.billImage;
  const billImgUrl = billImg?.url || null;

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: colors.bg,
          maxHeight: '88vh',
        },
      }}
    >
      {/* Handle */}
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 0 }}>
        <Box sx={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
      </Box>

      <Box sx={{ overflowY: 'auto', px: 2.5, pb: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 44, height: 44, borderRadius: 2,
                backgroundColor: colors.surfaceAlt,
                color: colors.textSecondary,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: colors.text }}>
                {TYPE_NAMES[expense.type] || expense.type}
              </Typography>
              {expense.isBulkPurchase && (
                <Chip
                  size="small"
                  label="Bulk purchase"
                  sx={{ height: 18, fontSize: 10, mt: 0.25, backgroundColor: colors.accentLight, color: colors.accent, fontWeight: 600 }}
                />
              )}
            </Box>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: colors.textMuted }}>
            <CloseRounded />
          </IconButton>
        </Box>

        {/* Amount hero */}
        <Box sx={{ mb: 2.5 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 500, color: colors.textMuted, letterSpacing: '0.04em', mb: 0.5 }}>
            AMOUNT
          </Typography>
          <Typography sx={{ fontSize: 40, fontWeight: 800, color: colors.text, letterSpacing: '-0.04em', lineHeight: 1 }}>
            {formatINR(expense.amount)}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: colors.border, mb: 2 }} />

        {/* Fields */}
        <Stack spacing={1.5} sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: 13, color: colors.textSecondary }}>Date</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.text }}>
              {formatDate(expense.date, 'DD MMM YYYY')}
            </Typography>
          </Box>
          {expense.paymentType && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: 13, color: colors.textSecondary }}>Payment</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.text }}>
                {PAYMENT_NAMES[expense.paymentType] || expense.paymentType}
              </Typography>
            </Box>
          )}
          {expense.vendorName && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: 13, color: colors.textSecondary }}>Vendor</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.text }}>{expense.vendorName}</Typography>
            </Box>
          )}
          {expense.billNumber && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: 13, color: colors.textSecondary }}>Bill no.</Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.text, fontFamily: typography.fontMono }}>
                {expense.billNumber}
              </Typography>
            </Box>
          )}
        </Stack>

        {/* Bill image */}
        {billImgUrl && (
          <Box sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: colors.textMuted, letterSpacing: '0.04em', mb: 1 }}>
              BILL PHOTO
            </Typography>
            <Box
              component="img"
              src={billImgUrl}
              alt="Bill"
              sx={{ width: '100%', borderRadius: 2, objectFit: 'cover', maxHeight: 260, border: `1px solid ${colors.border}` }}
            />
          </Box>
        )}

        {/* Notes */}
        {expense.notes && (
          <Box sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: colors.textMuted, letterSpacing: '0.04em', mb: 0.75 }}>
              NOTES
            </Typography>
            <Typography sx={{ fontSize: 14, color: colors.text, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {expense.notes}
            </Typography>
          </Box>
        )}

        {/* Delete */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<DeleteOutlineRounded />}
          onClick={onDelete}
          sx={{
            borderColor: colors.dangerBg,
            color: colors.danger,
            backgroundColor: colors.dangerBg,
            fontWeight: 600,
            '&:hover': { backgroundColor: colors.danger + '18', borderColor: colors.danger },
          }}
        >
          Delete expense
        </Button>
      </Box>
    </Drawer>
  );
};

/* ── Page ── */
const ExpensesListPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const [rangeKey, setRangeKey] = useState('month');
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [detailExpense, setDetailExpense] = useState(null);

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
    onSuccess: () => setDetailExpense(null),
  });

  const handleDelete = (expense) => {
    setDetailExpense(null);
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
            {rangeLabel?.toUpperCase()}
          </Typography>
          <Typography sx={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.04em', color: colors.text, lineHeight: 1, mb: 1 }}>
            {formatINR(summary.total)}
          </Typography>
          <Typography sx={{ fontSize: 13, color: colors.textSecondary }}>
            {summary.count} {summary.count === 1 ? 'entry' : 'entries'} · tap any to view details
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
            description={`Track expenses for ${rangeLabel?.toLowerCase()}.`}
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
                onClick={() => setDetailExpense(e)}
              />
            ))}
          </Stack>
        )}
      </Box>

      <ExpenseDetailDrawer
        expense={detailExpense}
        open={!!detailExpense}
        onClose={() => setDetailExpense(null)}
        onDelete={() => handleDelete(detailExpense)}
      />

      <FAB icon={<AddRounded />} label="Add Expense" onClick={() => navigate(ROUTES.EXPENSE_NEW)} />
    </Box>
  );
};

export default ExpensesListPage;
