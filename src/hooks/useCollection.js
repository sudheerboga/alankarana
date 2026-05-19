import { useEffect, useState, useRef, useMemo } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { buildQuery, snapshotToList } from '../firebase/queries';

/**
 * Subscribe to a Firestore collection (or filtered query).
 *
 *   const { items, loading, error } = useCollection('inventory', {
 *     where: [['category', '==', selectedCategory]],
 *     orderBy: [['createdAt', 'desc']],
 *     limit: 50,
 *   });
 *
 * Pass `enabled: false` to skip — useful when the query depends on state that
 * isn't ready yet (auth not loaded, no user id, etc).
 */
export const useCollection = (collectionName, spec, { enabled = true } = {}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Serialize the spec to a stable key so callers can pass inline objects.
  // JSON.stringify is fine here — specs are small + flat.
  const specKey = useMemo(() => JSON.stringify(spec ?? {}), [spec]);
  const stableSpec = useMemo(() => JSON.parse(specKey), [specKey]);

  // Track the latest unsubscribe to avoid race on rapid spec changes
  const unsubRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    setError(null);

    const q = buildQuery(collectionName, stableSpec);

    unsubRef.current?.();
    unsubRef.current = onSnapshot(
      q,
      (snap) => {
        setItems(snapshotToList(snap));
        setLoading(false);
      },
      (err) => {
        // Firestore offline cache will serve stale results; this fires for real errors only
        console.error(`[useCollection ${collectionName}]`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      unsubRef.current?.();
      unsubRef.current = null;
    };
  }, [collectionName, stableSpec, enabled]);

  return { items, loading, error };
};
