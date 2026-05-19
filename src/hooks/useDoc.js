import { useEffect, useState } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { docRef, snapshotToItem } from '../firebase/queries';

/**
 * Subscribe to a single Firestore doc.
 *
 *   const { item, loading, error, exists } = useDoc('inventory', itemId);
 */
export const useDoc = (collectionName, id, { enabled = true } = {}) => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exists, setExists] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled || !id) {
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    setError(null);

    const unsub = onSnapshot(
      docRef(collectionName, id),
      (snap) => {
        if (snap.exists()) {
          setItem(snapshotToItem(snap));
          setExists(true);
        } else {
          setItem(null);
          setExists(false);
        }
        setLoading(false);
      },
      (err) => {
        console.error(`[useDoc ${collectionName}/${id}]`, err);
        setError(err);
        setLoading(false);
      }
    );

    return unsub;
  }, [collectionName, id, enabled]);

  return { item, loading, exists, error };
};
