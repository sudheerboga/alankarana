import { Timestamp, serverTimestamp } from 'firebase/firestore';
import {
  create as fbCreate,
  update as fbUpdate,
  remove as fbRemove,
} from '../firebase/firestore';
import { COLLECTIONS } from '../constants';
import { toNumber } from '../utils/format';

const buildExpenseDoc = (input) => ({
  type: input.type,
  amount: toNumber(input.amount),
  date: input.date instanceof Date
    ? Timestamp.fromDate(input.date)
    : input.date?.toDate
      ? input.date
      : Timestamp.fromDate(new Date(input.date || Date.now())),
  notes: input.notes?.trim() || '',
  billImage: input.billImage || null,
  vendor: input.vendor || null,
  paymentType: input.paymentType || 'cash',
  // Bulk purchase fields (used for textile/jewellery purchases)
  isBulkPurchase: !!input.isBulkPurchase,
  vendorName: input.vendorName?.trim() || null,
  billNumber: input.billNumber?.trim() || null,
});

export const createExpense = async (input) => {
  const doc = buildExpenseDoc(input);
  const id = await fbCreate(COLLECTIONS.EXPENSES, doc);
  return { id, ...doc };
};

export const updateExpense = async (id, input) => {
  const doc = buildExpenseDoc(input);
  await fbUpdate(COLLECTIONS.EXPENSES, id, doc);
  return { id, ...doc };
};

export const deleteExpense = (id) => fbRemove(COLLECTIONS.EXPENSES, id);

export { serverTimestamp };
