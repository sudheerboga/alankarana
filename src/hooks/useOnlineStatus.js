import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setOnline, pushToast } from '../store/slices/uiSlice';

/**
 * Mount once in App. Syncs navigator.onLine + browser events to Redux.
 * Also fires a toast when reconnecting (felt nice in luxury apps; can be silenced).
 */
export const useOnlineStatus = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    let wasOffline = !navigator.onLine;

    const apply = (online) => {
      dispatch(setOnline(online));
      if (online && wasOffline) {
        dispatch(pushToast({ message: 'Back online — syncing changes', severity: 'success' }));
        wasOffline = false;
      } else if (!online) {
        wasOffline = true;
      }
    };

    apply(navigator.onLine);

    const handleOnline = () => apply(true);
    const handleOffline = () => apply(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);
};
