import { useState, useMemo } from 'react';
import { Autocomplete, TextField, Box, Typography, Chip } from '@mui/material';
import { Inventory2Outlined } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useCollection } from '../../hooks/useCollection';
import { useTheme } from '../../theme/ThemeProvider';
import { formatINR } from '../../utils/format';
import { COLLECTIONS } from '../../constants';
import { selectCategories } from '../../store/slices/categoriesSlice';

/**
 * Item picker — search inventory by name OR code. Only shows in-stock items by default.
 *   value: itemId | null
 *   onChange(itemId, fullItem)
 */
const ItemPicker = ({ value, onChange, label = 'Item', disabled, includeOutOfStock = false }) => {
  const { colors, typography } = useTheme();
  const { items, loading } = useCollection(COLLECTIONS.INVENTORY, { orderBy: [['itemName', 'asc']] });
  const allCategories = useSelector(selectCategories);
  const categoryMap = useMemo(
    () => Object.fromEntries(allCategories.map((c) => [c.id, c])),
    [allCategories]
  );

  const options = useMemo(
    () => (includeOutOfStock ? items : items.filter((i) => (i.remainingPieces ?? 0) > 0)),
    [items, includeOutOfStock]
  );

  const selected = options.find((i) => i.id === value) || null;

  return (
    <Autocomplete
      value={selected}
      onChange={(_, item) => onChange?.(item?.id ?? null, item ?? null)}
      options={options}
      loading={loading}
      disabled={disabled}
      getOptionLabel={(opt) => opt.itemName || ''}
      isOptionEqualToValue={(o, v) => o.id === v.id}
      componentsProps={{
        paper: {
          sx: {
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.18)`,
            borderRadius: 2,
          },
        },
      }}
      filterOptions={(opts, { inputValue }) => {
        const needle = inputValue.trim().toLowerCase();
        if (!needle) return opts.slice(0, 50);
        return opts.filter(
          (o) =>
            (o.itemNameLower || o.itemName?.toLowerCase() || '').includes(needle) ||
            (o.itemCode || '').toLowerCase().includes(needle)
        );
      }}
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder="Search by name or code…" fullWidth />
      )}
      renderOption={(props, item) => (
        <Box component="li" {...props} key={item.id} sx={{ display: 'flex', gap: 1.5, py: 1 }}>
          <Box
            sx={{
              width: 40, height: 40, borderRadius: 1,
              backgroundColor: colors.surfaceAlt,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: colors.textMuted,
              flexShrink: 0,
              overflow: 'hidden',
              backgroundImage: item.images?.[0]?.url ? `url(${item.images[0].url})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {!item.images?.[0]?.url && (
              categoryMap[item.category]?.icon
                ? <Box component="span" sx={{ fontSize: 22, lineHeight: 1, userSelect: 'none' }}>{categoryMap[item.category].icon}</Box>
                : <Inventory2Outlined fontSize="small" />
            )}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.text }}>
              {item.itemName}
            </Typography>
            <Typography sx={{ fontSize: 11, fontFamily: typography.fontMono, color: colors.textMuted }}>
              {item.itemCode}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.primary }}>
              {formatINR(item.sellingPricePerPiece)}
            </Typography>
            <Chip
              size="small"
              label={`${item.remainingPieces ?? 0} left`}
              sx={{
                height: 18,
                fontSize: 10,
                mt: 0.25,
                backgroundColor: (item.remainingPieces ?? 0) <= 3 ? colors.warningBg : colors.successBg,
                color: (item.remainingPieces ?? 0) <= 3 ? colors.warning : colors.success,
              }}
            />
          </Box>
        </Box>
      )}
      noOptionsText="No matching items"
    />
  );
};

export default ItemPicker;
