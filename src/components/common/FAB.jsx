import { Fab } from '@mui/material';
import { AddRounded } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * Floating action button — primary "add" action.
 * Positioned above bottom nav, respects safe area.
 */
const FAB = ({ icon = <AddRounded />, label = 'Add', onClick, ariaLabel }) => {
  const { colors, zIndex } = useTheme();

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        position: 'fixed',
        right: 16,
        bottom: 'calc(88px + env(safe-area-inset-bottom, 0px))',
        zIndex: zIndex.fixed - 1,
      }}
    >
      <Fab
        color="primary"
        onClick={onClick}
        aria-label={ariaLabel || label}
        variant="extended"
        sx={{
          backgroundColor: colors.text,
          color: colors.textInverse,
          boxShadow: '0 4px 16px rgba(16, 16, 26, 0.2)',
          '&:hover': { backgroundColor: colors.text, boxShadow: '0 6px 20px rgba(16, 16, 26, 0.25)' },
          fontWeight: 600,
          letterSpacing: '-0.005em',
          minHeight: 48,
          borderRadius: '100px',
          textTransform: 'none',
          fontSize: 14,
        }}
      >
        {icon}
        <span style={{ marginLeft: 6 }}>{label}</span>
      </Fab>
    </motion.div>
  );
};

export default FAB;
