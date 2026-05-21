import {
  create as fbCreate,
  update as fbUpdate,
  remove as fbRemove,
  getOne as fbGetOne,
  getMany as fbGetMany,
  serverTimestamp,
} from '../firebase/firestore';
import { generateItemCode } from '../utils/itemCode';
import { COLLECTIONS } from '../constants';
import { toNumber } from '../utils/format';

/**
 * Build the canonical inventory record from raw form input.
 * Computed fields (remainingPieces, totalPieces, etc.) live here so the same
 * shape is produced whether the data comes from the add form, the edit form,
 * or a future bulk-import script.
 */
export const buildInventoryDoc = (input, { isNew = true, existing = null } = {}) => {
  const setQuantity = toNumber(input.setQuantity, 1);
  const piecesPerSet = toNumber(input.piecesPerSet, 1);
  const totalPieces = toNumber(input.totalPieces, setQuantity * piecesPerSet);
  const costPerPiece = toNumber(input.costPerPiece);
  const sellingPricePerPiece = toNumber(input.sellingPricePerPiece);

  const soldPieces = isNew ? 0 : toNumber(existing?.soldPieces, 0);
  const remainingPieces = Math.max(0, totalPieces - soldPieces);

  const doc = {
    itemName: (input.itemName || '').trim(),
    category: input.category,
    setQuantity,
    piecesPerSet,
    totalPieces,
    soldPieces,
    remainingPieces,
    costPerPiece,
    sellingPricePerPiece,
    totalPurchaseCost: costPerPiece * totalPieces,
    notes: input.notes?.trim() || '',
    images: input.images || [],   // [{ url, publicId, width, height }]
    vendor: input.vendor || null, // optional vendorId

    // Searchable lowercase fields for prefix queries.
    // Firestore doesn't have full-text search; we use these for "starts-with" matches
    // and filter the rest client-side over the small dataset.
    itemNameLower: (input.itemName || '').trim().toLowerCase(),

    // Optional supplier/external barcode. Stored as-is for camera scan lookup.
    // null means not set — never stored as empty string to keep equality queries clean.
    barcode: (input.barcode || '').trim() || null,

    // User-editable intake date — distinct from createdAt (server timestamp).
    purchaseDate: input.purchaseDate ? new Date(input.purchaseDate) : null,
  };

  // Item code: generated on create; preserved on edit (codes are stable identifiers)
  if (isNew) {
    doc.itemCode = generateItemCode({
      costPerPiece,
      sellingPricePerPiece,
      date: new Date(),
    });
  } else if (existing?.itemCode) {
    doc.itemCode = existing.itemCode;
  }

  return doc;
};

/**
 * Create a new inventory item.
 */
export const createItem = async (input) => {
  const doc = buildInventoryDoc(input, { isNew: true });
  const id = await fbCreate(COLLECTIONS.INVENTORY, doc);
  return { id, ...doc };
};

/**
 * Update an existing item. We always read-modify-write through buildInventoryDoc
 * so derived fields stay consistent.
 */
export const updateItem = async (id, input) => {
  const existing = await fbGetOne(COLLECTIONS.INVENTORY, id);
  if (!existing) throw new Error('Item not found');
  const doc = buildInventoryDoc(input, { isNew: false, existing });
  await fbUpdate(COLLECTIONS.INVENTORY, id, doc);
  return { id, ...doc };
};

/**
 * Delete an item. Doesn't cascade — sales records keep their itemCode reference.
 * (If we ever need cascade, do it in a batch here.)
 */
export const deleteItem = (id) => fbRemove(COLLECTIONS.INVENTORY, id);

/**
 * Duplicate an item — used by the "quick duplicate" action for similar stock.
 * Resets sold/remaining counts and generates a fresh code.
 */
export const duplicateItem = async (id) => {
  const existing = await fbGetOne(COLLECTIONS.INVENTORY, id);
  if (!existing) throw new Error('Item not found');

  const doc = buildInventoryDoc(
    {
      ...existing,
      itemName: `${existing.itemName} (copy)`,
    },
    { isNew: true }
  );
  const newId = await fbCreate(COLLECTIONS.INVENTORY, doc);
  return { id: newId, ...doc };
};

/**
 * Look up an inventory item by a scanned barcode value.
 * Checks the `barcode` field first (supplier barcode stored during intake),
 * then falls back to `itemCode` (auto-generated code printed on price tags).
 * Returns the first match or null.
 */
export const findItemByBarcode = async (code) => {
  const trimmed = (code || '').trim();
  if (!trimmed) return null;

  const byBarcode = await fbGetMany(COLLECTIONS.INVENTORY, {
    where: [['barcode', '==', trimmed]],
    limit: 1,
  });
  if (byBarcode.length) return byBarcode[0];

  const byCode = await fbGetMany(COLLECTIONS.INVENTORY, {
    where: [['itemCode', '==', trimmed]],
    limit: 1,
  });
  return byCode[0] || null;
};

export { serverTimestamp };
