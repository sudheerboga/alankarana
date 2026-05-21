import { useState, useMemo } from 'react';
import { Box, Stack, Typography, Chip } from '@mui/material';
import { Inventory2Outlined, AddRounded } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import TopBar from '../../components/layout/TopBar';
import StickySearch from '../../components/common/StickySearch';
import EmptyState from '../../components/common/EmptyState';
import FAB from '../../components/common/FAB';
import ItemCard from '../../modules/inventory/ItemCard';
import ItemCardSkeleton from '../../modules/inventory/ItemCardSkeleton';
import InventoryFilterSheet from '../../modules/inventory/InventoryFilterSheet';
import { useCollection } from '../../hooks/useCollection';
import { filterItems, summarizeInventory } from '../../utils/inventoryFilters';
import { setFilters, resetFilters, selectInventoryFilters } from '../../store/slices/inventorySlice';
import { useTheme } from '../../theme/ThemeProvider';
import { COLLECTIONS, ROUTES } from '../../constants';

/**
 * Inventory list. Strategy:
 * - Subscribe to ALL inventory (typical boutique: ~hundreds, not thousands).
 * - Filter client-side via pure filterItems(). This is faster + cheaper than
 *   server-side filtering for small datasets, and works offline.
 * - If catalog grows past ~2-3k items, switch to server-side queries with
 *   Firestore where()/orderBy() — the buildQuery infra already supports it.
 */
const InventoryListPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const filters = useSelector(selectInventoryFilters);
  const { colors, typography } = useTheme();
  const [filterOpen, setFilterOpen] = useState(false);

  const { items, loading } = useCollection(
    COLLECTIONS.INVENTORY,
    { orderBy: [['createdAt', 'desc']] },
  );

  const filtered = useMemo(() => filterItems(items, filters), [items, filters]);
  const summary = useMemo(() => summarizeInventory(items), [items]);

  const activeFilterCount =
    (filters.category !== 'all' ? 1 : 0) +
    (filters.stockStatus !== 'all' ? 1 : 0) +
    (filters.priceRange !== 'all' ? 1 : 0) +
    (filters.flag ? 1 : 0) +
    (filters.sort !== 'recent' ? 1 : 0);

  return (
    <Box sx={{ pb: 10 }}>
      <TopBar title="Inventory" />

      <StickySearch
        value={filters.search}
        onChange={(v) => dispatch(setFilters({ search: v }))}
        placeholder="Search by name or code…"
        onFilterClick={() => setFilterOpen(true)}
        hasActiveFilters={activeFilterCount > 0}
      />

      {/* Summary strip */}
      <Box sx={{ px: 2, py: 1.5, display: 'flex', gap: 1, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
        <Chip
          size="small"
          label={`${summary.itemCount} items`}
          sx={{ backgroundColor: colors.surface, color: colors.text, fontWeight: 500, border: `1px solid ${colors.border}` }}
        />
        <Chip
          size="small"
          label={`${summary.totalUnits} units`}
          sx={{ backgroundColor: colors.surface, color: colors.text, fontWeight: 500, border: `1px solid ${colors.border}` }}
        />
        {summary.lowCount > 0 && (
          <Chip
            size="small"
            label={`${summary.lowCount} low`}
            sx={{ backgroundColor: colors.warningBg, color: colors.warning, fontWeight: 600 }}
          />
        )}
        {summary.outCount > 0 && (
          <Chip
            size="small"
            label={`${summary.outCount} out`}
            sx={{ backgroundColor: colors.dangerBg, color: colors.danger, fontWeight: 600 }}
          />
        )}
        {summary.oldCount > 0 && (
          <Chip
            size="small"
            label={`${summary.oldCount} old`}
            sx={{ backgroundColor: colors.infoBg, color: colors.info, fontWeight: 600 }}
          />
        )}
      </Box>

      {/* List */}
      <Box sx={{ px: 2 }}>
        {loading && items.length === 0 ? (
          <Stack spacing={1.5}>
            <ItemCardSkeleton />
            <ItemCardSkeleton />
            <ItemCardSkeleton />
            <ItemCardSkeleton />
          </Stack>
        ) : filtered.length === 0 ? (
          items.length === 0 ? (
            <EmptyState
              icon={Inventory2Outlined}
              title="No items yet"
              description="Add your first item to start tracking stock and sales."
              actionLabel="Add Item"
              onAction={() => navigate(ROUTES.ITEM_NEW)}
            />
          ) : (
            <EmptyState
              title="No matches"
              description="Try adjusting filters or search terms."
              actionLabel="Reset filters"
              onAction={() => dispatch(resetFilters())}
            />
          )
        ) : (
          <Stack spacing={1.5}>
            {filtered.map((item, idx) => (
              <ItemCard key={item.id} item={item} index={idx} />
            ))}
          </Stack>
        )}
      </Box>

      <FAB
        icon={<AddRounded />}
        label="Add Item"
        onClick={() => navigate(ROUTES.ITEM_NEW)}
      />

      <InventoryFilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onChange={(patch) => dispatch(setFilters(patch))}
        onReset={() => { dispatch(resetFilters()); setFilterOpen(false); }}
      />
    </Box>
  );
};

export default InventoryListPage;
