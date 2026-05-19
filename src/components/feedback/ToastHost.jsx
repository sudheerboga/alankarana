import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Snackbar, Alert, Slide } from '@mui/material';
import { selectToasts, dismissToast } from '../../store/slices/uiSlice';

const SlideUp = (props) => <Slide {...props} direction="up" />;

/**
 * Global toast outlet. Anywhere in the app, dispatch:
 *   dispatch(pushToast({ message: 'Saved', severity: 'success' }))
 * and one of these renders for ~3s.
 */
const ToastHost = () => {
  const toasts = useSelector(selectToasts);
  const dispatch = useDispatch();

  // Auto-dismiss after duration
  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((t) =>
      setTimeout(() => dispatch(dismissToast(t.id)), t.duration ?? 3000)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, dispatch]);

  // Show only the most recent (stack-like — simpler than queue UI)
  const current = toasts[toasts.length - 1];

  return (
    <Snackbar
      open={!!current}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      TransitionComponent={SlideUp}
      sx={{
        bottom: { xs: 80, sm: 80 }, // Sit above bottom nav
      }}
    >
      {current && (
        <Alert
          onClose={() => dispatch(dismissToast(current.id))}
          severity={current.severity || 'info'}
          variant="filled"
          sx={{ minWidth: 280, borderRadius: 2, boxShadow: 4 }}
        >
          {current.message}
        </Alert>
      )}
    </Snackbar>
  );
};

export default ToastHost;
