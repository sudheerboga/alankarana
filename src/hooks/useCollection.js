import { useEffect, useState, useRef, useMemo } from 'react';
import { onSnapshot, Timestamp } from 'firebase/firestore';
import { buildQuery, snapshotToList } from '../firebase/queries';

/**
 * Stable string key for a query spec.
 *
 * IMPORTANT: We cannot use JSON.stringify directly on the spec because
 * Firestore Timestamps have non-enumerable properties — they serialize to "{}".
 * That would collapse different date ranges to the same key (or worse,
 * round-trip back as empty objects if we tried JSON.parse) and break date filtering
 * across Sales, Expenses, Reports, and Dashboard.
 *
 * Instead, we walk the spec and replace Timestamp instances with their millis,
 * then stringify. This gives us a stable, change-detecting key — without
 * destroying the original Timestamps we pass to Firestore.
 */
const specToKey = (spec) => {
  if (!spec) return '{}';
  const normalize = (v) => {
    if (v == null) return v;
    if (v instanceof Timestamp) return { __ts: v.toMillis() };
    if (Array.isArray(v)) return v.map(normalize);
    if (typeof v === 'object') {
      const out = {};
      for (const k of Object.keys(v)) out[k] = normalize(v[k]);
      return out;
    }
    return v;
  };
  try {
    return JSON.stringify(normalize(spec));
  } catch {
    return Math.random().toString();
  }
};

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

  // Stable cache key for the effect dependency — handles Timestamps correctly.
  const specKey = useMemo(() => specToKey(spec), [spec]);

  // Keep the *live* spec (with real Timestamp instances) in a ref so the effect
  // can read it without re-running on every render.
  const specRef = useRef(spec);
  specRef.current = spec;

  // Track the latest unsubscribe to avoid race on rapid spec changes
  const unsubRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    setError(null);

    const q = buildQuery(collectionName, specRef.current);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, specKey, enabled]);

  return { items, loading, error };
};
