import { Box, Card, Typography, Chip } from '@mui/material';
import { Inventory2Outlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { formatINR, getStockStatus } from '../../utils/format';
import { STOCK_STATUS, ROUTES } from '../../constants';
import { cldUrl } from '../../services/cloudinary';
import { selectCategoryById } from '../../store/slices/categoriesSlice';

const STATUS_CONFIG = {
  [STOCK_STATUS.IN_STOCK]: { label: 'In stock', colorKey: 'success', bgKey: 'successBg' },
  [STOCK_STATUS.LOW]:      { label: 'Low stock', colorKey: 'warning', bgKey: 'warningBg' },
  [STOCK_STATUS.OUT]:      { label: 'Out',        colorKey: 'danger',  bgKey: 'dangerBg'  },
};

const ItemCard = ({ item, onClick, index = 0 }) => {
  const { colors, typography } = useTheme();
  const navigate = useNavigate();
  const category = useSelector(selectCategoryById(item.category));

  const handleClick = () => {
    if (onClick) return onClick(item);
    navigate(ROUTES.ITEM_DETAIL(item.id));
  };

  const status = getStockStatus(item.remainingPieces ?? 0);
  const { label: statusLabel, colorKey, bgKey } = STATUS_CONFIG[status];
  const statusFg  = colors[colorKey];
  const statusBg  = colors[bgKey];

  const img = item.images?.[0];
  const imgUrl = img?.publicId
    ? cldUrl(img.publicId, { width: 160, height: 160 })
    : img?.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: Math.min(index * 0.02, 0.18) }}
    >
      <Card
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'stretch',
          cursor: 'pointer',
          overflow: 'hidden',
          transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
          '&:active': { transform: 'scale(0.985)', opacity: 0.88 },
          '&:hover': { boxShadow: `0 2px 12px rgba(0,0,0,0.08)` },
        }}
      >
        {/* Thumbnail */}
        <Box
          sx={{
            width: 76,
            flexShrink: 0,
            backgroundColor: colors.surfaceAlt,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.textMuted,
            overflow: 'hidden',
            backgroundImage: imgUrl ? `url(${imgUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {!imgUrl && (
            category?.icon
              ? <Box component="span" sx={{ fontSize: 30, lineHeight: 1, userSelect: 'none' }}>{category.icon}</Box>
              : <Inventory2Outlined sx={{ fontSize: 26, color: colors.textMuted }} />
          )}
        </Box>

        {/* Main content */}
        <Box sx={{ flex: 1, minWidth: 0, p: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.4 }}>
          {/* Item name */}
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: colors.text,
              letterSpacing: '-0.01em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1.3,
            }}
          >
            {item.itemName}
          </Typography>

          {/* Category */}
          {category?.name && (
            <Typography
              sx={{ fontSize: 11, color: colors.textMuted, fontWeight: 500, lineHeight: 1.2 }}
            >
              {category.icon} {category.name}
            </Typography>
          )}

          {/* Item code */}
          <Typography
            sx={{
              fontSize: 10,
              fontFamily: typography.fontMono,
              color: colors.textMuted,
              letterSpacing: '0.03em',
              mt: 0.2,
            }}
          >
            {item.itemCode}
          </Typography>
        </Box>

        {/* Right: price + stock */}
        <Box
          sx={{
            pr: 1.5,
            pl: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: 0.75,
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontSize: 15,
              fontWeight: 700,
              color: colors.primary,
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            {formatINR(item.sellingPricePerPiece)}
          </Typography>

          <Chip
            label={`${statusLabel} · ${item.remainingPieces ?? 0}`}
            size="small"
            sx={{
              height: 18,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.01em',
              backgroundColor: statusBg,
              color: statusFg,
              borderRadius: '6px',
              '& .MuiChip-label': { px: 0.75 },
            }}
          />
        </Box>
      </Card>
    </motion.div>
  );
};

export default ItemCard;
