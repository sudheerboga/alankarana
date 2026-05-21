import { useState, useMemo } from 'react';
import {
  Box, Card, Stack, Typography, TextField, Button, Chip, IconButton, Checkbox, Tabs, Tab, Dialog,
} from '@mui/material';
import { AddRounded, DeleteOutlineRounded, RecordVoiceOverOutlined, CloseRounded, ChevronLeftRounded, ChevronRightRounded } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '../../components/layout/TopBar';
import EmptyState from '../../components/common/EmptyState';
import CategorySelect from '../../components/common/CategorySelect';
import ImagePicker from '../../components/common/ImagePicker';
import { useCollection } from '../../hooks/useCollection';
import { useMutation } from '../../hooks/useMutation';
import { createRequest, toggleRequestStatus, deleteRequest } from '../../services/requestService';
import { openConfirm } from '../../store/slices/uiSlice';
import { selectCategories } from '../../store/slices/categoriesSlice';
import { useTheme } from '../../theme/ThemeProvider';
import { formatRelative } from '../../utils/format';
import { COLLECTIONS, REQUEST_STATUS } from '../../constants';

/* ── Full-screen image viewer ── */
const ImageViewer = ({ images, startIndex = 0, open, onClose }) => {
  const [idx, setIdx] = useState(startIndex);

  const current = images?.[idx];
  const imgUrl = current?.url || null;
  const total = images?.length || 0;

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { backgroundColor: '#000', borderRadius: 0 } }}
    >
      <Box sx={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
            right: 12,
            zIndex: 10,
            backgroundColor: 'rgba(0,0,0,0.55)',
            color: '#fff',
          }}
        >
          <CloseRounded />
        </IconButton>

        {total > 1 && (
          <Typography
            sx={{
              position: 'absolute',
              top: 'calc(env(safe-area-inset-top, 0px) + 18px)',
              left: 0, right: 0,
              textAlign: 'center',
              color: 'rgba(255,255,255,0.7)',
              fontSize: 13,
              zIndex: 10,
            }}
          >
            {idx + 1} / {total}
          </Typography>
        )}

        {imgUrl && (
          <Box
            component="img"
            src={imgUrl}
            sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', userSelect: 'none' }}
          />
        )}

        {total > 1 && idx > 0 && (
          <IconButton
            onClick={() => setIdx((i) => i - 1)}
            sx={{ position: 'absolute', left: 8, backgroundColor: 'rgba(0,0,0,0.45)', color: '#fff' }}
          >
            <ChevronLeftRounded />
          </IconButton>
        )}
        {total > 1 && idx < total - 1 && (
          <IconButton
            onClick={() => setIdx((i) => i + 1)}
            sx={{ position: 'absolute', right: 8, backgroundColor: 'rgba(0,0,0,0.45)', color: '#fff' }}
          >
            <ChevronRightRounded />
          </IconButton>
        )}
      </Box>
    </Dialog>
  );
};

/* ── Request card ── */
const RequestCard = ({ req, isDone, onToggle, onDelete, onViewImage, categoryNameMap }) => {
  const { colors } = useTheme();
  const images = req.images || [];

  return (
    <Card sx={{ p: 1.5, opacity: isDone ? 0.6 : 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <Checkbox
          checked={isDone}
          onChange={onToggle}
          sx={{ p: 0.5, mt: -0.25 }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{
            fontSize: 14,
            color: colors.text,
            textDecoration: isDone ? 'line-through' : 'none',
            whiteSpace: 'pre-line',
          }}>
            {req.description}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
            {req.category && (
              <Chip
                size="small"
                label={categoryNameMap[req.category] || req.category}
                sx={{ height: 18, fontSize: 10, backgroundColor: colors.surfaceAlt, color: colors.text }}
              />
            )}
            <Typography sx={{ fontSize: 11, color: colors.textMuted }}>
              {formatRelative(req.createdAt)}
            </Typography>
          </Box>

          {/* Image thumbnails */}
          {images.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.75, mt: 1, flexWrap: 'wrap' }}>
              {images.map((img, i) => (
                <Box
                  key={img.url || i}
                  onClick={() => onViewImage(i)}
                  sx={{
                    width: 56, height: 56,
                    borderRadius: 1.5,
                    backgroundImage: `url(${img.url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: `1px solid ${colors.border}`,
                    cursor: 'pointer',
                    flexShrink: 0,
                    '&:active': { opacity: 0.75 },
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
        <IconButton size="small" onClick={onDelete} sx={{ color: colors.textMuted }}>
          <DeleteOutlineRounded fontSize="small" />
        </IconButton>
      </Box>
    </Card>
  );
};

/* ── Page ── */
const RequestsPage = () => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const [tab, setTab] = useState(0);
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newImages, setNewImages] = useState([]);
  const [viewer, setViewer] = useState(null); // { images, startIndex }

  const { items: requests, loading } = useCollection(
    COLLECTIONS.REQUESTED_ITEMS,
    { orderBy: [['createdAt', 'desc']] }
  );

  const filtered = useMemo(() => {
    if (tab === 0) return requests.filter((r) => r.status === REQUEST_STATUS.PENDING);
    if (tab === 1) return requests.filter((r) => r.status === REQUEST_STATUS.COMPLETED);
    return requests;
  }, [requests, tab]);

  const pendingCount = requests.filter((r) => r.status === REQUEST_STATUS.PENDING).length;

  const categoryNameMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  const add = useMutation(createRequest, {
    successMessage: 'Request added',
    errorMessage: 'Could not add',
    onSuccess: () => { setNewDesc(''); setNewCategory(''); setNewImages([]); },
  });

  const toggle = useMutation(
    ({ id, status }) => toggleRequestStatus(id, status),
    { silent: true }
  );

  const remove = useMutation(deleteRequest, {
    successMessage: 'Removed',
    errorMessage: 'Could not remove',
  });

  const handleAdd = () => {
    if (!newDesc.trim()) return;
    add.run({ description: newDesc, category: newCategory, images: newImages });
  };

  const handleDelete = (req) => {
    dispatch(
      openConfirm({
        title: 'Remove this request?',
        message: req.description,
        confirmLabel: 'Remove',
        severity: 'danger',
        onConfirm: () => remove.run(req.id),
      })
    );
  };

  return (
    <Box sx={{ pb: 10 }}>
      <TopBar title="Customer Requests" />

      {/* Quick add */}
      <Box sx={{ p: 2 }}>
        <Card sx={{ p: 2 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick add
          </Typography>
          <Stack spacing={1.5}>
            <TextField
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="e.g. Red silk saree, size 38"
              fullWidth
              multiline
              minRows={2}
              maxRows={3}
            />
            <CategorySelect
              value={newCategory}
              onChange={setNewCategory}
              label="Category (optional)"
            />
            <ImagePicker
              label="Reference photos (optional)"
              value={newImages}
              onChange={setNewImages}
              maxImages={4}
              folder="requests"
            />
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={handleAdd}
              disabled={!newDesc.trim() || add.loading}
              fullWidth
            >
              {add.loading ? 'Adding…' : 'Add Request'}
            </Button>
          </Stack>
        </Card>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{ borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.surface }}>
        <Tab label={`Pending${pendingCount ? ` (${pendingCount})` : ''}`} />
        <Tab label="Completed" />
        <Tab label="All" />
      </Tabs>

      <Box sx={{ p: 2 }}>
        {loading && requests.length === 0 ? (
          <Stack spacing={1.5}>{[1, 2, 3].map((i) => <Card key={i} sx={{ height: 64, opacity: 0.5 }} />)}</Stack>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={RecordVoiceOverOutlined}
            title={tab === 0 ? 'No pending requests' : tab === 1 ? 'No completed requests' : 'No requests yet'}
            description="Customer asks for items you don't have? Note it here so you can plan market purchases."
          />
        ) : (
          <Stack spacing={1.5}>
            <AnimatePresence>
              {filtered.map((req) => {
                const isDone = req.status === REQUEST_STATUS.COMPLETED;
                return (
                  <motion.div
                    key={req.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.2 }}
                  >
                    <RequestCard
                      req={req}
                      isDone={isDone}
                      categoryNameMap={categoryNameMap}
                      onToggle={() => toggle.run({ id: req.id, status: req.status })}
                      onDelete={() => handleDelete(req)}
                      onViewImage={(startIndex) => setViewer({ images: req.images || [], startIndex })}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </Stack>
        )}
      </Box>

      {/* Image viewer */}
      {viewer && (
        <ImageViewer
          images={viewer.images}
          startIndex={viewer.startIndex}
          open={!!viewer}
          onClose={() => setViewer(null)}
        />
      )}
    </Box>
  );
};

export default RequestsPage;
