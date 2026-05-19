import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Snackbar, Alert, Slide } from '@mui/material';
import { selectToasts, dismissToast } from '../../store/slices/uiSlice';
import { useTheme } from '../../theme/ThemeProvider';

const SlideUp = (props) => <Slide {...props} direction="up" />;

const SEVERITY_COLORS = {
  success: { bg: '#1e7e44', text: '#fff' },
  error:   { bg: '#c0392b', text: '#fff' },
  warning: { bg: '#b8690a', text: '#fff' },
  info:    { bg: '#1565c0', text: '#fff' },
};

/**
 * Global toast outlet. Anywhere in the app, dispatch:
 *   dispatch(pushToast({ message: 'Saved', severity: 'success' }))
 * and one of these renders for ~3s.
 */
const ToastHost = () => {
  const toasts = useSelector(selectToasts);
  const dispatch = useDispatch();
  const { colors } = useTheme();

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((t) =>
      setTimeout(() => dispatch(dismissToast(t.id)), t.duration ?? 3000)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, dispatch]);

  const current = toasts[toasts.length - 1];
  const palette = SEVERITY_COLORS[current?.severity] ?? SEVERITY_COLORS.info;

  return (
    <Snackbar
      open={!!current}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      TransitionComponent={SlideUp}
      sx={{
        // Sit above the bottom nav + safe area on all devices
        bottom: 'calc(72px + env(safe-area-inset-bottom, 0px) + 12px) !important',
        left: '16px !important',
        right: '16px !important',
        width: 'auto',
        transform: 'none !important',
      }}
    >
      {current && (
        <Alert
          onClose={() => dispatch(dismissToast(current.id))}
          severity={current.severity || 'info'}
          variant="filled"
          sx={{
            width: '100%',
            borderRadius: 2.5,
            boxShadow: '0 4px 20px rgba(0,0,0,0.22)',
            backgroundColor: palette.bg,
            color: palette.text,
            fontSize: 14,
            fontWeight: 500,
            alignItems: 'center',
            '& .MuiAlert-icon': { color: palette.text, opacity: 0.9 },
            '& .MuiAlert-action': { color: palette.text, opacity: 0.8, pt: 0 },
          }}
        >
          {current.message}
        </Alert>
      )}
    </Snackbar>
  );
};

export default ToastHost;
