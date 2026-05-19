import {
  addDoc,
  collection,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  runTransaction,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import { buildQuery, docRef, snapshotToItem, snapshotToList } from './queries';

/**
 * Firestore CRUD service. All writes go through here so we can:
 *   - add server timestamps consistently
 *   - centralize error shaping
 *   - hook in optimistic updates and offline queue later
 *
 * Reads are split: one-shot via getOne/getMany, reactive via hooks (see useCollection.js).
 */

const stripUndefined = (obj) => {
  // Firestore rejects `undefined` values. Strip them rather than fail loudly.
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    if (v !== undefined) out[k] = v;
  }
  return out;
};

export const create = async (collectionName, data) => {
  const ref = await addDoc(collection(db, collectionName), {
    ...stripUndefined(data),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

/**
 * Create with explicit ID (useful when ID derives from item code or business key).
 */
export const createWithId = async (collectionName, id, data) => {
  await setDoc(docRef(collectionName, id), {
    ...stripUndefined(data),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
};

export const update = async (collectionName, id, data) => {
  await updateDoc(docRef(collectionName, id), {
    ...stripUndefined(data),
    updatedAt: serverTimestamp(),
  });
};

export const remove = async (collectionName, id) => {
  await deleteDoc(docRef(collectionName, id));
};

export const getOne = async (collectionName, id) => {
  const snap = await getDoc(docRef(collectionName, id));
  return snap.exists() ? snapshotToItem(snap) : null;
};

export const getMany = async (collectionName, spec) => {
  const q = buildQuery(collectionName, spec);
  const snap = await getDocs(q);
  return snapshotToList(snap);
};

/**
 * Atomic transaction wrapper. Use for inventory + sale writes where stock must
 * decrement consistently with sale creation (Round 3+).
 *
 *   await txn(async (t) => {
 *     const item = await t.get(docRef('inventory', itemId));
 *     t.update(docRef('inventory', itemId), { remainingPieces: item.data().remainingPieces - qty });
 *     t.set(docRef('sales', saleId), saleData);
 *   });
 */
export const txn = (callback) => runTransaction(db, callback);

/**
 * Batched writes — when ordering isn't critical but you want one commit.
 */
export const batch = () => writeBatch(db);

/**
 * Re-export so callers don't import firebase directly.
 */
export { serverTimestamp };
