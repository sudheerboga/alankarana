import dayjs from 'dayjs';
import { Timestamp } from 'firebase/firestore';

/**
 * Convert a date-range key (or custom start/end) into Firestore Timestamps
 * for use in where clauses.
 *
 *   getDateRange('today')        → { start, end } covering today
 *   getDateRange('week')         → last 7 days
 *   getDateRange('month')        → last 30 days
 *   getDateRange('custom', d1, d2)
 *   getDateRange('all')          → null (caller should skip the where clause)
 */
export const getDateRange = (key, customStart, customEnd) => {
  if (key === 'all') return null;

  let start;
  let end = dayjs().endOf('day');

  switch (key) {
    case 'today':
      start = dayjs().startOf('day');
      break;
    case 'yesterday':
      start = dayjs().subtract(1, 'day').startOf('day');
      end = dayjs().subtract(1, 'day').endOf('day');
      break;
    case 'week':
      start = dayjs().subtract(6, 'day').startOf('day');
      break;
    case 'month':
      start = dayjs().subtract(29, 'day').startOf('day');
      break;
    case 'this_month':
      start = dayjs().startOf('month');
      break;
    case 'last_month':
      start = dayjs().subtract(1, 'month').startOf('month');
      end = dayjs().subtract(1, 'month').endOf('month');
      break;
    case 'quarter':
      start = dayjs().subtract(89, 'day').startOf('day');
      break;
    case 'year':
      start = dayjs().subtract(364, 'day').startOf('day');
      break;
    case 'custom':
      if (!customStart || !customEnd) return null;
      start = dayjs(customStart).startOf('day');
      end = dayjs(customEnd).endOf('day');
      break;
    default:
      start = dayjs().startOf('day');
  }

  return {
    start: Timestamp.fromDate(start.toDate()),
    end: Timestamp.fromDate(end.toDate()),
    label: getRangeLabel(key, customStart, customEnd),
  };
};

export const getRangeLabel = (key, customStart, customEnd) => {
  switch (key) {
    case 'today': return 'Today';
    case 'yesterday': return 'Yesterday';
    case 'week': return 'Last 7 days';
    case 'month': return 'Last 30 days';
    case 'this_month': return 'This month';
    case 'last_month': return 'Last month';
    case 'quarter': return 'Last 90 days';
    case 'year': return 'Last year';
    case 'all': return 'All time';
    case 'custom':
      if (!customStart || !customEnd) return 'Custom';
      return `${dayjs(customStart).format('DD MMM')} – ${dayjs(customEnd).format('DD MMM')}`;
    default: return '';
  }
};

export const DATE_RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
  { value: 'year', label: 'Last year' },
  { value: 'all', label: 'All time' },
];
