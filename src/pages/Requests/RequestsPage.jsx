import { useState, useMemo } from 'react';
import {
  Box, Card, Stack, Typography, TextField, Button, Chip, IconButton, Checkbox, Tabs, Tab,
} from '@mui/material';
import { AddRounded, DeleteOutlineRounded, RecordVoiceOverOutlined } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '../../components/layout/TopBar';
import EmptyState from '../../components/common/EmptyState';
import CategorySelect from '../../components/common/CategorySelect';
import { useCollection } from '../../hooks/useCollection';
import { useMutation } from '../../hooks/useMutation';
import { createRequest, toggleRequestStatus, deleteRequest } from '../../services/requestService';
import { openConfirm } from '../../store/slices/uiSlice';
import { selectCategories } from '../../store/slices/categoriesSlice';
import { useTheme } from '../../theme/ThemeProvider';
import { formatRelative } from '../../utils/format';
import { COLLECTIONS, REQUEST_STATUS } from '../../constants';

const RequestsPage = () => {
  const { colors, typography } = useTheme();
  const dispatch = useDispatch();
  const categories = useSelector(selectCategories);
  const [tab, setTab] = useState(0); // 0 = pending, 1 = completed, 2 = all
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('');

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
    onSuccess: () => { setNewDesc(''); setNewCategory(''); },
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
    add.run({ description: newDesc, category: newCategory });
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
            title={tab === 0 ? "No pending requests" : tab === 1 ? "No completed requests" : "No requests yet"}
            description="Customer asks for items you don't have? Note it here so you can plan market purchases."
          />
        ) : (
          <Stack spacing={1.5}>
            <AnimatePresence>
              {filtered.map((req, idx) => {
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
                    <Card sx={{ p: 1.5, opacity: isDone ? 0.6 : 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Checkbox
                          checked={isDone}
                          onChange={() => toggle.run({ id: req.id, status: req.status })}
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
                        </Box>
                        <IconButton size="small" onClick={() => handleDelete(req)} sx={{ color: colors.textMuted }}>
                          <DeleteOutlineRounded fontSize="small" />
                        </IconButton>
                      </Box>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default RequestsPage;
