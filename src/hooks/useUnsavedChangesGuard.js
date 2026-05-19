import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useBlocker } from 'react-router-dom';
import { markFormClean, markFormDirty, openConfirm } from '../store/slices/uiSlice';

/**
 * Per-form guard. Pass a stable `formId` and the current `isDirty` flag.
 *
 * - Tracks dirty state in Redux (so global checks can know).
 * - Blocks browser tab close / refresh with native confirm.
 * - Blocks React Router navigation with our themed confirm dialog.
 */
export const useUnsavedChangesGuard = (formId, isDirty) => {
  const dispatch = useDispatch();

  // Sync dirty state to redux
  useEffect(() => {
    if (isDirty) dispatch(markFormDirty(formId));
    else dispatch(markFormClean(formId));
    return () => dispatch(markFormClean(formId));
  }, [dispatch, formId, isDirty]);

  // Native browser warning on tab close / refresh
  useEffect(() => {
    if (!isDirty) return undefined;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // React Router blocker — fires our themed confirm dialog.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state !== 'blocked') return;

    dispatch(
      openConfirm({
        title: 'Leave this page?',
        message: 'You have unsaved changes. They will be lost if you leave now.',
        confirmLabel: 'Leave',
        cancelLabel: 'Stay',
        severity: 'danger',
        onConfirm: () => blocker.proceed(),
        onCancel: () => blocker.reset(),
      })
    );
  }, [blocker, dispatch]);
};
