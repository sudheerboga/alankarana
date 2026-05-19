import {
  collection,
  doc,
  query as fsQuery,
  where as fsWhere,
  orderBy as fsOrderBy,
  limit as fsLimit,
  startAfter as fsStartAfter,
} from 'firebase/firestore';
import { db } from './config';

/**
 * Build a Firestore Query from a plain JS spec.
 *
 *   buildQuery('inventory', {
 *     where: [['category', '==', 'sarees'], ['remainingPieces', '>', 0]],
 *     orderBy: [['createdAt', 'desc']],
 *     limit: 20,
 *   })
 *
 * This is the single place we touch Firestore's query primitives, so callers
 * stay plain-object friendly and easy to memo/serialize.
 */
export const buildQuery = (collectionName, spec = {}) => {
  const colRef = collection(db, collectionName);
  const clauses = [];

  if (spec.where) {
    for (const [field, op, value] of spec.where) {
      // Skip clauses where the value is undefined — common when filters are unset
      if (value === undefined || value === null || value === 'all' || value === '') continue;
      clauses.push(fsWhere(field, op, value));
    }
  }
  if (spec.orderBy) {
    for (const [field, dir = 'asc'] of spec.orderBy) {
      clauses.push(fsOrderBy(field, dir));
    }
  }
  if (spec.startAfter) clauses.push(fsStartAfter(spec.startAfter));
  if (spec.limit) clauses.push(fsLimit(spec.limit));

  return clauses.length ? fsQuery(colRef, ...clauses) : colRef;
};

/**
 * Doc ref shortcut — `docRef('inventory', 'abc123')`.
 */
export const docRef = (collectionName, id) => doc(db, collectionName, id);

/**
 * Convert a QueryDocumentSnapshot into a plain object with id.
 * Used by every hook so callers get { id, ...data } shape consistently.
 */
export const snapshotToItem = (snap) => ({ id: snap.id, ...snap.data() });

/**
 * Convert an array of QuerySnapshot docs.
 */
export const snapshotToList = (snap) => snap.docs.map(snapshotToItem);
