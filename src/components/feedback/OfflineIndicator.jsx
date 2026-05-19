import { Box, Typography } from '@mui/material';
import { CloudOffRounded } from '@mui/icons-material';
import { AnimatePresence, motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectOnline } from '../../store/slices/uiSlice';
import { useTheme } from '../../theme/ThemeProvider';

const OfflineIndicator = () => {
  const online = useSelector(selectOnline);
  const { colors, zIndex } = useTheme();

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'fixed',
            top: 'env(safe-area-inset-top, 0px)',
            left: 0,
            right: 0,
            zIndex: zIndex.toast,
          }}
        >
          <Box
            sx={{
              backgroundColor: colors.warningBg,
              color: colors.warning,
              padding: '6px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              borderBottom: `1px solid ${colors.warning}`,
            }}
          >
            <CloudOffRounded fontSize="small" />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              You are offline — changes will sync when reconnected
            </Typography>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;
