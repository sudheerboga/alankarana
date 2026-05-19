import { Box, Card, Typography, Chip } from '@mui/material';
import { Inventory2Outlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeProvider';
import { formatINR, getStockStatus } from '../../utils/format';
import { STOCK_STATUS, ROUTES } from '../../constants';
import { cldUrl } from '../../services/cloudinary';

const STATUS_COPY = {
  [STOCK_STATUS.IN_STOCK]: { label: 'In stock', color: 'success' },
  [STOCK_STATUS.LOW]: { label: 'Low stock', color: 'warning' },
  [STOCK_STATUS.OUT]: { label: 'Out of stock', color: 'danger' },
};

const ItemCard = ({ item, onClick, index = 0 }) => {
  const { colors, typography } = useTheme();
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) return onClick(item);
    navigate(ROUTES.ITEM_DETAIL(item.id));
  };

  const status = getStockStatus(item.remainingPieces ?? 0);
  const statusCopy = STATUS_COPY[status];
  const statusBg = colors[`${statusCopy.color}Bg`];
  const statusFg = colors[statusCopy.color];

  // Use first image or fallback
  const img = item.images?.[0];
  const imgUrl = img?.publicId
    ? cldUrl(img.publicId, { width: 200, height: 200 })
    : img?.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.2) }}
    >
      <Card
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'stretch',
          gap: 1.5,
          p: 1.5,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          '&:active': { transform: 'scale(0.99)' },
          '&:hover': { borderColor: colors.borderStrong },
        }}
      >
        {/* Image */}
        <Box
          sx={{
            width: 72, height: 72,
            flexShrink: 0,
            borderRadius: 1.5,
            backgroundColor: colors.surfaceAlt,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: colors.textMuted,
            overflow: 'hidden',
            backgroundImage: imgUrl ? `url(${imgUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {!imgUrl && <Inventory2Outlined sx={{ fontSize: 28 }} />}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Box>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: colors.text,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.itemName}
            </Typography>
            <Typography
              sx={{
                fontSize: 11,
                color: colors.textMuted,
                fontFamily: typography.fontMono,
                letterSpacing: '0.02em',
                mt: 0.25,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {item.itemCode}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                color: colors.primary,
                fontFamily: typography.fontDisplay,
              }}
            >
              {formatINR(item.sellingPricePerPiece)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography sx={{ fontSize: 12, color: colors.textSecondary }}>
                {item.remainingPieces ?? 0} left
              </Typography>
              <Chip
                size="small"
                label={statusCopy.label}
                sx={{
                  height: 20,
                  fontSize: 10,
                  fontWeight: 600,
                  backgroundColor: statusBg,
                  color: statusFg,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              />
            </Box>
          </Box>
        </Box>
      </Card>
    </motion.div>
  );
};

export default ItemCard;
