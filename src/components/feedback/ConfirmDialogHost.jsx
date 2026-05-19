import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, useMediaQuery } from '@mui/material';
import { WarningRounded } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { closeConfirm, selectConfirmDialog } from '../../store/slices/uiSlice';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * Centralized confirm dialog. Anywhere in the app:
 *
 *   dispatch(openConfirm({
 *     title: 'Delete this item?',
 *     message: 'Kanchi Silk Saree — this cannot be undone.',
 *     confirmLabel: 'Delete',
 *     severity: 'danger',
 *     onConfirm: () => deleteItem(id),
 *   }))
 *
 * On phones, renders as a bottom sheet feel; on desktop, centered modal.
 */
const ConfirmDialogHost = () => {
  const dialog = useSelector(selectConfirmDialog);
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const isMobile = useMediaQuery('(max-width: 600px)');

  if (!dialog) return null;

  const {
    title = 'Are you sure?',
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    severity = 'default',
    onConfirm,
  } = dialog;

  const handleConfirm = async () => {
    try {
      await onConfirm?.();
    } finally {
      dispatch(closeConfirm());
    }
  };

  const close = () => dispatch(closeConfirm());

  const isDanger = severity === 'danger';

  return (
    <Dialog
      open
      onClose={close}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          margin: isMobile ? 0 : 2,
          position: isMobile ? 'absolute' : 'relative',
          bottom: isMobile ? 0 : 'auto',
          width: isMobile ? '100%' : 'auto',
          borderRadius: isMobile ? '20px 20px 0 0' : 3,
          paddingBottom: isMobile ? 'env(safe-area-inset-bottom)' : 0,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pt: 3 }}>
        {isDanger && (
          <Box
            sx={{
              width: 36, height: 36, borderRadius: '50%',
              backgroundColor: colors.dangerBg,
              color: colors.danger,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <WarningRounded fontSize="small" />
          </Box>
        )}
        <Typography component="span" sx={{ fontSize: 18, fontWeight: 600, color: colors.text }}>
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ color: colors.textSecondary, fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={close} fullWidth variant="outlined" sx={{ color: colors.textSecondary, borderColor: colors.border }}>
          {cancelLabel}
        </Button>
        <Button
          onClick={handleConfirm}
          fullWidth
          variant="contained"
          color={isDanger ? 'error' : 'primary'}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialogHost;
