import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { setCategories, setCategoriesError } from '../store/slices/categoriesSlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { COLLECTIONS } from '../constants';

/**
 * Mount once. Subscribes to the `categories` collection and merges custom
 * categories with the defaults. Skipped if user isn't authenticated.
 */
export const useCategoriesSync = () => {
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!isAuth) return undefined;

    const unsub = onSnapshot(
      collection(db, COLLECTIONS.CATEGORIES),
      (snap) => {
        const custom = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        dispatch(setCategories(custom));
      },
      (err) => {
        console.error('[categoriesSync]', err);
        dispatch(setCategoriesError(err.message));
      }
    );

    return unsub;
  }, [dispatch, isAuth]);
};
