import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { LOW_STOCK_THRESHOLD, OLD_STOCK_DAYS, STOCK_STATUS } from '../constants';

dayjs.extend(relativeTime);

/**
 * Format as INR currency. Uses Intl for locale-correct grouping (1,00,000 not 100,000).
 */
export const formatINR = (amount, { compact = false } = {}) => {
  const n = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
    notation: compact ? 'compact' : 'standard',
  }).format(n);
};

/**
 * Format relative time — "2 hours ago", "yesterday", etc. Wraps dayjs.
 */
export const formatRelative = (date) => {
  if (!date) return '—';
  const d = date.toDate ? date.toDate() : new Date(date);
  return dayjs(d).fromNow();
};

export const formatDate = (date, fmt = 'DD MMM YYYY') => {
  if (!date) return '—';
  const d = date.toDate ? date.toDate() : new Date(date);
  return dayjs(d).format(fmt);
};

/**
 * Compute stock status from remaining pieces.
 */
export const getStockStatus = (remainingPieces) => {
  if (remainingPieces <= 0) return STOCK_STATUS.OUT;
  if (remainingPieces <= LOW_STOCK_THRESHOLD) return STOCK_STATUS.LOW;
  return STOCK_STATUS.IN_STOCK;
};

/**
 * Is this item "old stock"? Anything not sold within OLD_STOCK_DAYS.
 */
export const isOldStock = (item) => {
  if (!item?.createdAt) return false;
  const created = item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
  const daysSince = dayjs().diff(dayjs(created), 'day');
  return daysSince >= OLD_STOCK_DAYS && (item.soldPieces || 0) < (item.totalPieces || 0);
};

/**
 * Profit math — single source of truth.
 * Returns negative values for loss (don't suppress them; the UI shows them as warnings).
 */
export const computeSaleProfit = ({ costPerPiece, actualSellingPrice, quantity, discount = 0 }) => {
  const cost = Number(costPerPiece) || 0;
  const sell = Number(actualSellingPrice) || 0;
  const qty = Number(quantity) || 0;
  const disc = Number(discount) || 0;

  const grossSale = sell * qty;
  const totalSale = Math.max(0, grossSale - disc);
  const totalCost = cost * qty;
  const profit = totalSale - totalCost;
  const margin = totalSale > 0 ? (profit / totalSale) * 100 : 0;

  return { totalSale, totalCost, profit, margin, isLoss: profit < 0 };
};

/**
 * Overall inventory value snapshot — at cost.
 */
export const computeInventoryValue = (items = []) =>
  items.reduce((sum, it) => sum + (it.remainingPieces || 0) * (it.costPerPiece || 0), 0);

/**
 * Expected profit if everything currently in stock sold at default selling price.
 */
export const computeExpectedProfit = (items = []) =>
  items.reduce(
    (sum, it) =>
      sum + (it.remainingPieces || 0) * ((it.sellingPricePerPiece || 0) - (it.costPerPiece || 0)),
    0
  );

/**
 * Truncate text with ellipsis — for card titles on narrow screens.
 */
export const truncate = (str, n = 30) => {
  if (!str) return '';
  return str.length > n ? `${str.slice(0, n - 1)}…` : str;
};

/**
 * Safe number — converts anything to a number, defaulting to 0.
 */
export const toNumber = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
