import { Box, Card, Typography } from '@mui/material';
import { Inventory2Outlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../theme/ThemeProvider';
import { formatINR, getStockStatus } from '../../utils/format';
import { STOCK_STATUS, ROUTES } from '../../constants';
import { cldUrl } from '../../services/cloudinary';

const STATUS_COPY = {
  [STOCK_STATUS.IN_STOCK]: { label: 'In stock', color: 'success' },
  [STOCK_STATUS.LOW]: { label: 'Low', color: 'warning' },
  [STOCK_STATUS.OUT]: { label: 'Out', color: 'danger' },
};

const ItemCard = ({ item, onClick, index = 0 }) => {
  const { colors } = useTheme();
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) return onClick(item);
    navigate(ROUTES.ITEM_DETAIL(item.id));
  };

  const status = getStockStatus(item.remainingPieces ?? 0);
  const statusCopy = STATUS_COPY[status];
  const statusFg = colors[statusCopy.color];

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
          gap: 2,
          p: 1.75,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          '&:active': { transform: 'scale(0.99)' },
          '&:hover': { borderColor: colors.borderStrong },
        }}
      >
        {/* Image */}
        <Box
          sx={{
            width: 64, height: 64,
            flexShrink: 0,
            borderRadius: 2,
            backgroundColor: colors.surfaceAlt,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: colors.textMuted,
            overflow: 'hidden',
            backgroundImage: imgUrl ? `url(${imgUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {!imgUrl && <Inventory2Outlined sx={{ fontSize: 24 }} />}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.5 }}>
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
            {item.itemName}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography sx={{ fontSize: 12, color: colors.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.itemCode}
            </Typography>
            <Box sx={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: colors.textMuted, flexShrink: 0 }} />
            <Typography sx={{ fontSize: 12, color: statusFg, fontWeight: 600 }}>
              {statusCopy.label} · {item.remainingPieces ?? 0}
            </Typography>
          </Box>
        </Box>

        {/* Price */}
        <Box sx={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center', flexShrink: 0 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: colors.text, letterSpacing: '-0.02em' }}>
            {formatINR(item.sellingPricePerPiece)}
          </Typography>
        </Box>
      </Card>
    </motion.div>
  );
};

export default ItemCard;
