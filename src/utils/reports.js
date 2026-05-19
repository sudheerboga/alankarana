import dayjs from 'dayjs';
import { toNumber } from './format';

/**
 * Reports engine — pure functions, no Firestore.
 * Caller fetches raw sales/expenses/inventory and passes them in.
 * That way the same code powers dashboard widgets and reports pages.
 */

/**
 * Aggregate sales into a single bucket.
 */
export const aggregateSales = (sales = []) => {
  let revenue = 0;
  let cost = 0;
  let profit = 0;
  let totalQty = 0;
  let lossCount = 0;

  for (const s of sales) {
    revenue += toNumber(s.totalSaleAmount);
    cost += toNumber(s.totalCost);
    profit += toNumber(s.profit);
    totalQty += toNumber(s.quantity);
    if (s.isLoss) lossCount += 1;
  }

  return {
    count: sales.length,
    revenue,
    cost,
    profit,
    totalQty,
    margin: revenue > 0 ? (profit / revenue) * 100 : 0,
    lossCount,
    avgSale: sales.length ? revenue / sales.length : 0,
  };
};

/**
 * Group sales into time buckets for chart rendering.
 *   bucketBy: 'day' | 'week' | 'month'
 * Returns array of { label, date, revenue, profit, count }
 */
export const groupSalesByBucket = (sales = [], bucketBy = 'day') => {
  const buckets = new Map();

  for (const s of sales) {
    const d = s.soldAt?.toDate ? s.soldAt.toDate() : new Date(s.soldAt);
    if (!d || isNaN(d)) continue;

    let key;
    let label;
    switch (bucketBy) {
      case 'week':
        key = dayjs(d).startOf('week').format('YYYY-MM-DD');
        label = dayjs(d).startOf('week').format('DD MMM');
        break;
      case 'month':
        key = dayjs(d).format('YYYY-MM');
        label = dayjs(d).format('MMM YY');
        break;
      case 'day':
      default:
        key = dayjs(d).format('YYYY-MM-DD');
        label = dayjs(d).format('DD MMM');
    }

    if (!buckets.has(key)) {
      buckets.set(key, { key, label, date: d, revenue: 0, profit: 0, cost: 0, count: 0 });
    }
    const b = buckets.get(key);
    b.revenue += toNumber(s.totalSaleAmount);
    b.profit += toNumber(s.profit);
    b.cost += toNumber(s.totalCost);
    b.count += 1;
  }

  return Array.from(buckets.values()).sort((a, b) => a.date - b.date);
};

/**
 * Top categories by revenue.
 */
export const topCategoriesByRevenue = (sales = [], limit = 5) => {
  const map = new Map();
  for (const s of sales) {
    if (!s.category) continue;
    map.set(s.category, (map.get(s.category) || 0) + toNumber(s.totalSaleAmount));
  }
  return Array.from(map.entries())
    .map(([category, revenue]) => ({ category, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
};

/**
 * Best selling items by quantity sold (across the period).
 */
export const bestSellingItems = (sales = [], limit = 5) => {
  const map = new Map();
  for (const s of sales) {
    const key = s.itemId;
    if (!key) continue;
    if (!map.has(key)) {
      map.set(key, {
        itemId: key, itemName: s.itemName, itemCode: s.itemCode,
        quantity: 0, revenue: 0, profit: 0,
      });
    }
    const item = map.get(key);
    item.quantity += toNumber(s.quantity);
    item.revenue += toNumber(s.totalSaleAmount);
    item.profit += toNumber(s.profit);
  }
  return Array.from(map.values()).sort((a, b) => b.quantity - a.quantity).slice(0, limit);
};

/**
 * Expense breakdown by type.
 */
export const expensesByType = (expenses = []) => {
  const map = new Map();
  for (const e of expenses) {
    map.set(e.type, (map.get(e.type) || 0) + toNumber(e.amount));
  }
  return Array.from(map.entries())
    .map(([type, amount]) => ({ type, amount }))
    .sort((a, b) => b.amount - a.amount);
};

/**
 * Profit/loss summary — net of sales profit minus expenses.
 */
export const netProfitLoss = (sales = [], expenses = []) => {
  const saleProfit = aggregateSales(sales).profit;
  const totalExpense = expenses.reduce((sum, e) => sum + toNumber(e.amount), 0);
  return {
    saleProfit,
    totalExpense,
    net: saleProfit - totalExpense,
  };
};
