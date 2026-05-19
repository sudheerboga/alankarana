import { Box, Card, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '../../theme/ThemeProvider';
import { formatINR, formatRelative } from '../../utils/format';

const SaleCard = ({ sale, onClick, index = 0, menuButton }) => {
  const { colors } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.2) }}
    >
      <Card
        onClick={onClick}
        sx={{
          p: 2,
          cursor: onClick ? 'pointer' : 'default',
          '&:active': onClick ? { transform: 'scale(0.99)' } : {},
          transition: 'transform 0.15s ease',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: colors.text,
                letterSpacing: '-0.01em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {sale.itemName}
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                color: colors.textMuted,
                mt: 0.25,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              Qty {sale.quantity} · {sale.itemCode}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
            <Typography
              sx={{
                fontSize: 17,
                fontWeight: 700,
                color: colors.text,
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              {formatINR(sale.totalSaleAmount)}
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                color: sale.isLoss ? colors.danger : colors.success,
                fontWeight: 600,
                mt: 0.5,
              }}
            >
              {sale.isLoss ? '' : '+'}{formatINR(sale.profit)}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: `1px solid ${colors.border}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 500, color: colors.textSecondary, textTransform: 'capitalize', flexShrink: 0 }}>
              {sale.paymentType || 'cash'}
            </Typography>
            {sale.customerName && (
              <>
                <Box sx={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: colors.textMuted, flexShrink: 0 }} />
                <Typography sx={{ fontSize: 11, color: colors.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {sale.customerName}
                </Typography>
              </>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
            <Typography sx={{ fontSize: 11, color: colors.textMuted }}>
              {formatRelative(sale.soldAt)}
            </Typography>
            {menuButton}
          </Box>
        </Box>
      </Card>
    </motion.div>
  );
};

export default SaleCard;
