import { useEffect, useCallback, useRef } from 'react';

/**
 * Auto-save a form's values to localStorage and restore them on mount.
 *
 *   const { restore, clear } = useFormDraft('item-new', { autoSaveMs: 800 });
 *   useEffect(() => {
 *     const draft = restore();
 *     if (draft) reset(draft); // react-hook-form's reset
 *   }, []);
 *
 *   // In a watcher / effect:
 *   useEffect(() => save(formValues), [formValues]);
 *
 *   // After successful save:
 *   clear();
 *
 * The debounced save avoids hammering localStorage on every keystroke.
 */
const KEY_PREFIX = 'alankarana:draft:';

export const useFormDraft = (formId, { autoSaveMs = 800 } = {}) => {
  const key = `${KEY_PREFIX}${formId}`;
  const timerRef = useRef(null);

  const save = useCallback(
    (values) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        try {
          // Only save if there's something to save (avoids empty-form noise)
          const hasData = values && Object.values(values).some(
            (v) => v !== '' && v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0)
          );
          if (hasData) {
            localStorage.setItem(key, JSON.stringify({ values, savedAt: Date.now() }));
          }
        } catch {
          // localStorage quota or private mode — silently ignore
        }
      }, autoSaveMs);
    },
    [key, autoSaveMs]
  );

  const restore = useCallback(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Drafts older than 7 days are stale
      if (Date.now() - parsed.savedAt > 7 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed.values;
    } catch {
      return null;
    }
  }, [key]);

  const clear = useCallback(() => {
    try {
      clearTimeout(timerRef.current);
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }, [key]);

  // Cleanup pending save on unmount
  useEffect(() => () => clearTimeout(timerRef.current), []);

  return { save, restore, clear };
};
