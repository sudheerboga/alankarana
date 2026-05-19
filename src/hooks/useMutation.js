import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { pushToast } from '../store/slices/uiSlice';

/**
 * Generic mutation hook — wraps any async function with loading + error state
 * and surfaces success/error toasts automatically.
 *
 *   const saveItem = useMutation(
 *     (data) => create('inventory', data),
 *     { successMessage: 'Item added', errorMessage: 'Could not save item' }
 *   );
 *
 *   await saveItem.run(formData);
 *   // saveItem.loading, saveItem.error available
 */
export const useMutation = (fn, options = {}) => {
  const {
    successMessage,
    errorMessage = 'Something went wrong',
    onSuccess,
    onError,
    silent = false, // skip auto-toasts (useful for transactions with their own UX)
  } = options;

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fn(...args);
        if (successMessage && !silent) {
          dispatch(pushToast({ message: successMessage, severity: 'success' }));
        }
        onSuccess?.(result, ...args);
        return result;
      } catch (err) {
        console.error('[useMutation]', err);
        setError(err);
        if (!silent) {
          dispatch(
            pushToast({
              message: err?.message?.includes('offline')
                ? "You're offline — saved locally, will sync"
                : errorMessage,
              severity: err?.message?.includes('offline') ? 'info' : 'error',
            })
          );
        }
        onError?.(err, ...args);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fn, successMessage, errorMessage, silent, onSuccess, onError, dispatch]
  );

  return { run, loading, error };
};
