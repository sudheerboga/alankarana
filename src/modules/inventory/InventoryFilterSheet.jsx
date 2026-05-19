import {
  Drawer, Box, Typography, Stack, Chip, Button, IconButton, Divider, useMediaQuery,
} from '@mui/material';
import { CloseRounded } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectCategories } from '../../store/slices/categoriesSlice';
import { useTheme } from '../../theme/ThemeProvider';

const STOCK_OPTIONS = [
  { value: 'all', label: 'All stock' },
  { value: 'in_stock', label: 'In stock' },
  { value: 'low', label: 'Low stock' },
  { value: 'out', label: 'Out of stock' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recently added' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'bestselling', label: 'Best selling' },
];

const FLAG_OPTIONS = [
  { value: null, label: 'All items' },
  { value: 'new', label: 'New (7 days)' },
  { value: 'old', label: 'Old stock' },
  { value: 'bestselling', label: 'Best sellers' },
];

const FilterChips = ({ options, value, onChange }) => {
  const { colors } = useTheme();
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <Chip
            key={opt.value ?? 'none'}
            label={opt.label}
            onClick={() => onChange(opt.value)}
            sx={{
              borderRadius: 99,
              fontWeight: 500,
              fontSize: 13,
              backgroundColor: active ? colors.primary : colors.surfaceAlt,
              color: active ? colors.textInverse : colors.text,
              border: 'none',
              '&:hover': {
                backgroundColor: active ? colors.primaryHover : colors.surfaceMuted,
              },
            }}
          />
        );
      })}
    </Stack>
  );
};

const InventoryFilterSheet = ({ open, onClose, filters, onChange, onReset }) => {
  const categories = useSelector(selectCategories);
  const { colors, typography } = useTheme();
  const isMobile = useMediaQuery('(max-width: 600px)');

  const categoryOptions = [
    { id: 'all', name: 'All categories' },
    ...categories,
  ];

  return (
    <Drawer
      anchor={isMobile ? 'bottom' : 'right'}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : 360,
          maxHeight: isMobile ? '85vh' : '100%',
          borderTopLeftRadius: isMobile ? 24 : 0,
          borderTopRightRadius: isMobile ? 24 : 0,
          backgroundColor: colors.bg,
        },
      }}
    >
      {/* Handle (mobile) */}
      {isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 0.5 }}>
          <Box sx={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
        </Box>
      )}

      <Box sx={{ p: 2.5, pb: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography sx={{ fontFamily: typography.fontDisplay, fontSize: 22, fontWeight: 600, color: colors.text }}>
            Filters
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseRounded />
          </IconButton>
        </Box>

        <Stack spacing={2.5}>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary, mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Category
            </Typography>
            <FilterChips
              options={categoryOptions.map((c) => ({ value: c.id, label: c.name }))}
              value={filters.category}
              onChange={(v) => onChange({ category: v })}
            />
          </Box>

          <Divider sx={{ borderColor: colors.border }} />

          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary, mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Stock
            </Typography>
            <FilterChips
              options={STOCK_OPTIONS}
              value={filters.stockStatus}
              onChange={(v) => onChange({ stockStatus: v })}
            />
          </Box>

          <Divider sx={{ borderColor: colors.border }} />

          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary, mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Show
            </Typography>
            <FilterChips
              options={FLAG_OPTIONS}
              value={filters.flag}
              onChange={(v) => onChange({ flag: v })}
            />
          </Box>

          <Divider sx={{ borderColor: colors.border }} />

          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary, mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Sort
            </Typography>
            <FilterChips
              options={SORT_OPTIONS}
              value={filters.sort}
              onChange={(v) => onChange({ sort: v })}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button fullWidth variant="outlined" onClick={onReset} sx={{ borderColor: colors.border }}>
              Reset
            </Button>
            <Button fullWidth variant="contained" onClick={onClose}>
              Apply
            </Button>
          </Box>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default InventoryFilterSheet;
