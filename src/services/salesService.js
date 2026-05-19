import {
  doc,
  collection,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { txn, remove as fbRemove } from '../firebase/firestore';
import { COLLECTIONS } from '../constants';
import { computeSaleProfit, toNumber } from '../utils/format';

/**
 * Record a sale. This is the most critical write in the app — if stock and
 * sale records get out of sync, reports lie. So we wrap it in a Firestore
 * transaction:
 *
 *   1. Read item — check it exists and has enough stock
 *   2. Compute profit from item.costPerPiece + actual selling price
 *   3. Write sale doc
 *   4. Update item's soldPieces + remainingPieces atomically
 *
 * If any step fails, nothing commits. If two staff sell the same item at the
 * same time, Firestore retries automatically.
 */
export const recordSale = async ({
  itemId,
  quantity,
  actualSellingPrice,
  discount = 0,
  customerName = '',
  paymentType = 'cash',
  notes = '',
  soldBy = null,
}) => {
  const qty = toNumber(quantity);
  if (qty <= 0) throw new Error('Quantity must be at least 1');

  const itemRef = doc(db, COLLECTIONS.INVENTORY, itemId);
  const saleRef = doc(collection(db, COLLECTIONS.SALES));

  return txn(async (t) => {
    const itemSnap = await t.get(itemRef);
    if (!itemSnap.exists()) throw new Error('Item no longer exists');

    const item = itemSnap.data();
    const remaining = toNumber(item.remainingPieces, 0);

    if (remaining < qty) {
      throw new Error(`Only ${remaining} piece(s) left in stock`);
    }

    const { totalSale, totalCost, profit, margin, isLoss } = computeSaleProfit({
      costPerPiece: item.costPerPiece,
      actualSellingPrice,
      quantity: qty,
      discount,
    });

    const saleDoc = {
      // Reference data (denormalized for fast list rendering without joins)
      itemId,
      itemCode: item.itemCode,
      itemName: item.itemName,
      category: item.category,

      // Sale specifics
      quantity: qty,
      costPerPiece: toNumber(item.costPerPiece),
      defaultSellingPrice: toNumber(item.sellingPricePerPiece),
      actualSellingPrice: toNumber(actualSellingPrice),
      discount: toNumber(discount),

      // Computed totals
      totalSaleAmount: totalSale,
      totalCost,
      profit,
      margin,
      isLoss,

      // Metadata
      customerName: customerName?.trim() || null,
      paymentType,
      notes: notes?.trim() || '',
      soldBy: soldBy || null,
      soldAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    };

    t.set(saleRef, saleDoc);
    t.update(itemRef, {
      soldPieces: increment(qty),
      remainingPieces: increment(-qty),
      updatedAt: serverTimestamp(),
    });

    return { id: saleRef.id, ...saleDoc };
  });
};

/**
 * Reverse a sale — adds stock back, removes the sale record.
 * Used for "Delete sale" / refund flow. Also atomic.
 */
export const reverseSale = async (saleId) => {
  const saleRef = doc(db, COLLECTIONS.SALES, saleId);

  return txn(async (t) => {
    const saleSnap = await t.get(saleRef);
    if (!saleSnap.exists()) throw new Error('Sale not found');
    const sale = saleSnap.data();

    // If the item still exists, restore stock. If the item was deleted after
    // the sale, we just delete the sale record — no stock to restore to.
    const itemRef = doc(db, COLLECTIONS.INVENTORY, sale.itemId);
    const itemSnap = await t.get(itemRef);

    if (itemSnap.exists()) {
      t.update(itemRef, {
        soldPieces: increment(-sale.quantity),
        remainingPieces: increment(sale.quantity),
        updatedAt: serverTimestamp(),
      });
    }

    t.delete(saleRef);
    return true;
  });
};

/**
 * One-shot delete used when reverseSale shouldn't restore stock
 * (e.g. admin cleanup of an erroneous duplicate).
 */
export const deleteSaleOnly = (saleId) => fbRemove(COLLECTIONS.SALES, saleId);
