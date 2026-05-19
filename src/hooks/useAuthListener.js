import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { authLoading, authSuccess, authLoggedOut, authError } from '../store/slices/authSlice';
import { subscribeToAuth, fetchUserRole } from '../firebase/auth';

/**
 * Mount once in App. Listens to Firebase auth state and syncs to Redux.
 * Triggers role fetch on login so RBAC checks have data immediately.
 */
export const useAuthListener = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(authLoading());

    const unsub = subscribeToAuth(async (user) => {
      if (!user) {
        dispatch(authLoggedOut());
        return;
      }
      try {
        const role = await fetchUserRole(user.uid);
        // Only persist serializable fields — Firebase User has methods we don't want in Redux
        dispatch(
          authSuccess({
            user: {
              uid: user.uid,
              email: user.email,
              phoneNumber: user.phoneNumber,
              displayName: user.displayName,
              photoURL: user.photoURL,
            },
            role,
          })
        );
      } catch (err) {
        console.error('[useAuthListener] failed to fetch role:', err);
        dispatch(authError(err.message || 'Failed to load user profile'));
      }
    });

    return unsub;
  }, [dispatch]);
};
