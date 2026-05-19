import { getStockStatus, isOldStock } from './format';
import { STOCK_STATUS } from '../constants';

/**
 * Apply the dashboard/list filters to a raw items array.
 * Pure function — no Firestore, no React. Easy to test.
 *
 *   filterItems(items, {
 *     search: 'silk', category: 'sarees', stockStatus: 'low', sort: 'recent'
 *   })
 */
export const filterItems = (items, filters = {}) => {
  const {
    search = '',
    category = 'all',
    stockStatus = 'all',
    flag = null, // 'old' | 'new' | 'bestselling' | null
    sort = 'recent',
  } = filters;

  const needle = search.trim().toLowerCase();

  let out = items.filter((it) => {
    // Search — match item name OR item code (case-insensitive)
    if (needle) {
      const nameMatch = (it.itemNameLower || it.itemName?.toLowerCase() || '').includes(needle);
      const codeMatch = (it.itemCode || '').toLowerCase().includes(needle);
      if (!nameMatch && !codeMatch) return false;
    }
    // Category
    if (category !== 'all' && it.category !== category) return false;
    // Stock status
    if (stockStatus !== 'all') {
      const status = getStockStatus(it.remainingPieces ?? 0);
      if (status !== stockStatus) return false;
    }
    // Flags
    if (flag === 'old' && !isOldStock(it)) return false;
    if (flag === 'new') {
      // "New" = added in last 7 days
      const created = it.createdAt?.toDate
        ? it.createdAt.toDate()
        : it.createdAt
          ? new Date(it.createdAt)
          : null;
      if (!created) return false;
      const days = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
      if (days > 7) return false;
    }
    if (flag === 'bestselling') {
      if (!it.totalPieces || it.soldPieces / it.totalPieces < 0.5) return false;
    }
    return true;
  });

  // Sort
  const getDate = (it) =>
    it.createdAt?.toDate ? it.createdAt.toDate().getTime() : new Date(it.createdAt || 0).getTime();

  switch (sort) {
    case 'name':
      out.sort((a, b) => (a.itemName || '').localeCompare(b.itemName || ''));
      break;
    case 'oldest':
      out.sort((a, b) => getDate(a) - getDate(b));
      break;
    case 'bestselling':
      out.sort((a, b) => (b.soldPieces || 0) - (a.soldPieces || 0));
      break;
    case 'recent':
    default:
      out.sort((a, b) => getDate(b) - getDate(a));
  }

  return out;
};

/**
 * Quick summary stats for an items array — used by dashboard.
 */
export const summarizeInventory = (items = []) => {
  let totalUnits = 0;
  let totalValue = 0;
  let lowCount = 0;
  let outCount = 0;
  let oldCount = 0;

  for (const it of items) {
    const remaining = it.remainingPieces || 0;
    totalUnits += remaining;
    totalValue += remaining * (it.costPerPiece || 0);

    const status = getStockStatus(remaining);
    if (status === STOCK_STATUS.LOW) lowCount += 1;
    if (status === STOCK_STATUS.OUT) outCount += 1;
    if (isOldStock(it)) oldCount += 1;
  }

  return {
    itemCount: items.length,
    totalUnits,
    totalValue,
    lowCount,
    outCount,
    oldCount,
  };
};
