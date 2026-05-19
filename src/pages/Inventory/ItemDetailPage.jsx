import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box, Card, Typography, Stack, Button, IconButton, Chip, Divider, Menu, MenuItem, ListItemIcon,
} from '@mui/material';
import {
  EditRounded, MoreVertRounded, DeleteRounded, ContentCopyRounded,
  Inventory2Outlined, ContentPasteRounded, PointOfSaleRounded,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import TopBar from '../../components/layout/TopBar';
import EmptyState from '../../components/common/EmptyState';
import { useDoc } from '../../hooks/useDoc';
import { useMutation } from '../../hooks/useMutation';
import { deleteItem, duplicateItem } from '../../services/inventoryService';
import { openConfirm, pushToast } from '../../store/slices/uiSlice';
import { useTheme } from '../../theme/ThemeProvider';
import { formatINR, formatRelative, formatDate, getStockStatus } from '../../utils/format';
import { COLLECTIONS, ROUTES, STOCK_STATUS } from '../../constants';
import { cldUrl } from '../../services/cloudinary';

const STATUS_COPY = {
  [STOCK_STATUS.IN_STOCK]: { label: 'In stock', color: 'success' },
  [STOCK_STATUS.LOW]: { label: 'Low stock', color: 'warning' },
  [STOCK_STATUS.OUT]: { label: 'Out of stock', color: 'danger' },
};

const StatBlock = ({ label, value, accent }) => {
  const { colors, typography } = useTheme();
  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: 11,
          color: colors.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontWeight: 600,
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: typography.fontDisplay,
          fontSize: 22,
          fontWeight: 600,
          color: accent ? colors.primary : colors.text,
          lineHeight: 1.1,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};

const ItemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { colors, typography } = useTheme();
  const [menuAnchor, setMenuAnchor] = useState(null);

  const { item, loading, exists } = useDoc(COLLECTIONS.INVENTORY, id);

  const remove = useMutation(
    (itemId) => deleteItem(itemId),
    {
      successMessage: 'Item deleted',
      errorMessage: 'Could not delete item',
      onSuccess: () => navigate(ROUTES.ITEMS, { replace: true }),
    }
  );

  const duplicate = useMutation(
    (itemId) => duplicateItem(itemId),
    {
      successMessage: 'Item duplicated',
      errorMessage: 'Could not duplicate',
      onSuccess: (result) => navigate(ROUTES.ITEM_DETAIL(result.id)),
    }
  );

  const handleDelete = () => {
    setMenuAnchor(null);
    dispatch(
      openConfirm({
        title: 'Delete this item?',
        message: `${item.itemName}\nCode: ${item.itemCode}\n\nThis action cannot be undone.`,
        confirmLabel: 'Delete',
        severity: 'danger',
        onConfirm: () => remove.run(id),
      })
    );
  };

  const handleCopyCode = async () => {
    setMenuAnchor(null);
    try {
      await navigator.clipboard.writeText(item.itemCode);
      dispatch(pushToast({ message: 'Code copied', severity: 'success' }));
    } catch {
      dispatch(pushToast({ message: 'Could not copy', severity: 'error' }));
    }
  };

  if (loading) {
    return (
      <Box>
        <TopBar title="Loading…" back />
      </Box>
    );
  }

  if (!exists) {
    return (
      <Box>
        <TopBar title="Item not found" back />
        <EmptyState
          icon={Inventory2Outlined}
          title="Item not found"
          description="This item may have been deleted."
          actionLabel="Back to inventory"
          onAction={() => navigate(ROUTES.ITEMS)}
        />
      </Box>
    );
  }

  const status = getStockStatus(item.remainingPieces ?? 0);
  const statusCopy = STATUS_COPY[status];
  const profit = (item.sellingPricePerPiece || 0) - (item.costPerPiece || 0);
  const margin = item.sellingPricePerPiece > 0 ? (profit / item.sellingPricePerPiece) * 100 : 0;

  const img = item.images?.[0];
  const imgUrl = img?.publicId ? cldUrl(img.publicId, { width: 800 }) : img?.url;

  return (
    <Box sx={{ pb: 12 }}>
      <TopBar
        title="Item"
        back
        actions={
          <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ color: colors.text }}>
            <MoreVertRounded />
          </IconButton>
        }
      />

      <Menu
        anchorEl={menuAnchor}
        open={!!menuAnchor}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: { minWidth: 200, borderRadius: 2 } }}
      >
        <MenuItem onClick={handleCopyCode}>
          <ListItemIcon><ContentPasteRounded fontSize="small" /></ListItemIcon>
          Copy code
        </MenuItem>
        <MenuItem onClick={() => { setMenuAnchor(null); duplicate.run(id); }}>
          <ListItemIcon><ContentCopyRounded fontSize="small" /></ListItemIcon>
          Duplicate
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: colors.danger }}>
          <ListItemIcon><DeleteRounded fontSize="small" sx={{ color: colors.danger }} /></ListItemIcon>
          Delete
        </MenuItem>
      </Menu>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <Box sx={{ p: 2 }}>
          {/* Hero image */}
          <Box
            sx={{
              width: '100%',
              aspectRatio: '4/3',
              borderRadius: 3,
              overflow: 'hidden',
              backgroundColor: colors.surfaceAlt,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.textMuted,
              backgroundImage: imgUrl ? `url(${imgUrl})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              mb: 2,
            }}
          >
            {!imgUrl && <Inventory2Outlined sx={{ fontSize: 64 }} />}
          </Box>

          {/* Title block */}
          <Stack spacing={0.5} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                size="small"
                label={statusCopy.label}
                sx={{
                  height: 22,
                  fontSize: 11,
                  fontWeight: 600,
                  backgroundColor: colors[`${statusCopy.color}Bg`],
                  color: colors[statusCopy.color],
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              />
              <Typography sx={{ fontSize: 12, color: colors.textMuted }}>
                Added {formatRelative(item.createdAt)}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontFamily: typography.fontDisplay,
                fontSize: 28,
                fontWeight: 600,
                color: colors.text,
                lineHeight: 1.15,
              }}
            >
              {item.itemName}
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                fontFamily: typography.fontMono,
                color: colors.textMuted,
                letterSpacing: '0.02em',
              }}
            >
              {item.itemCode}
            </Typography>
          </Stack>

          {/* Stat grid */}
          <Card sx={{ p: 2, mb: 2 }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <StatBlock label="Selling Price" value={formatINR(item.sellingPricePerPiece)} accent />
                <StatBlock label="Cost Price" value={formatINR(item.costPerPiece)} />
              </Box>
              <Divider sx={{ borderColor: colors.border }} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <StatBlock
                  label="Profit / piece"
                  value={
                    <Box component="span" sx={{ color: profit >= 0 ? colors.success : colors.danger }}>
                      {profit >= 0 ? '+' : ''}{formatINR(profit)}
                    </Box>
                  }
                />
                <StatBlock label="Margin" value={`${margin.toFixed(1)}%`} />
              </Box>
            </Stack>
          </Card>

          {/* Stock */}
          <Card sx={{ p: 2, mb: 2 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Stock
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <StatBlock label="Remaining" value={item.remainingPieces ?? 0} accent />
              <StatBlock label="Sold" value={item.soldPieces ?? 0} />
              <StatBlock label="Total" value={item.totalPieces ?? 0} />
            </Box>
            <Divider sx={{ borderColor: colors.border, my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: 13, color: colors.textSecondary }}>
                Total purchase cost
              </Typography>
              <Typography sx={{ fontSize: 16, fontWeight: 600, color: colors.text }}>
                {formatINR(item.totalPurchaseCost ?? (item.costPerPiece * item.totalPieces))}
              </Typography>
            </Box>
          </Card>

          {/* Notes */}
          {item.notes && (
            <Card sx={{ p: 2, mb: 2 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary, mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Notes
              </Typography>
              <Typography sx={{ fontSize: 14, color: colors.text, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {item.notes}
              </Typography>
            </Card>
          )}

          {/* Actions */}
          <Stack spacing={1.5}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<PointOfSaleRounded />}
              onClick={() => navigate(`${ROUTES.SALE_NEW}?itemId=${item.id}`)}
              disabled={item.remainingPieces <= 0}
              sx={{ py: 1.5 }}
            >
              {item.remainingPieces <= 0 ? 'Out of stock' : 'Record a sale'}
            </Button>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<EditRounded />}
              onClick={() => navigate(ROUTES.ITEM_EDIT(item.id))}
              sx={{ py: 1.5, borderColor: colors.border, color: colors.text }}
            >
              Edit item
            </Button>
          </Stack>
        </Box>
      </motion.div>
    </Box>
  );
};

export default ItemDetailPage;
