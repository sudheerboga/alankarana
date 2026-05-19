import { useState } from 'react';
import {
  Box, Card, List, ListItem, ListItemText, IconButton, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Chip, Stack,
} from '@mui/material';
import { AddRounded, DeleteOutlineRounded } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import TopBar from '../../components/layout/TopBar';
import FAB from '../../components/common/FAB';
import { selectCategories } from '../../store/slices/categoriesSlice';
import { createWithId, remove } from '../../firebase/firestore';
import { openConfirm, pushToast } from '../../store/slices/uiSlice';
import { useTheme } from '../../theme/ThemeProvider';
import { COLLECTIONS, DEFAULT_CATEGORIES } from '../../constants';

const DEFAULT_IDS = new Set(DEFAULT_CATEGORIES.map((c) => c.id));

const CategoriesPage = () => {
  const categories = useSelector(selectCategories);
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const id = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      await createWithId(COLLECTIONS.CATEGORIES, id, { id, name: trimmed, custom: true });
      dispatch(pushToast({ message: `Added "${trimmed}"`, severity: 'success' }));
      setName('');
      setDialogOpen(false);
    } catch (err) {
      dispatch(pushToast({ message: 'Could not add', severity: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (cat) => {
    if (DEFAULT_IDS.has(cat.id)) {
      dispatch(pushToast({ message: 'Default categories cannot be deleted', severity: 'warning' }));
      return;
    }
    dispatch(openConfirm({
      title: `Delete "${cat.name}"?`,
      message: 'Items in this category will keep their reference. You can still see them by code or name.',
      confirmLabel: 'Delete',
      severity: 'danger',
      onConfirm: async () => {
        try {
          await remove(COLLECTIONS.CATEGORIES, cat.id);
          dispatch(pushToast({ message: 'Deleted', severity: 'success' }));
        } catch {
          dispatch(pushToast({ message: 'Could not delete', severity: 'error' }));
        }
      },
    }));
  };

  return (
    <Box sx={{ pb: 10 }}>
      <TopBar title="Categories" back />
      <Box sx={{ p: 2 }}>
        <Card sx={{ overflow: 'hidden' }}>
          <List sx={{ py: 0 }}>
            {categories.map((cat, i) => (
              <ListItem
                key={cat.id}
                divider={i < categories.length - 1}
                secondaryAction={
                  DEFAULT_IDS.has(cat.id) ? (
                    <Chip size="small" label="Default" sx={{ height: 18, fontSize: 10, backgroundColor: colors.surfaceAlt, color: colors.textMuted }} />
                  ) : (
                    <IconButton edge="end" onClick={() => handleDelete(cat)} sx={{ color: colors.textMuted }}>
                      <DeleteOutlineRounded />
                    </IconButton>
                  )
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {cat.icon && <Box component="span">{cat.icon}</Box>}
                      <Typography sx={{ fontSize: 15, fontWeight: 500, color: colors.text }}>{cat.name}</Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Card>
      </Box>

      <FAB icon={<AddRounded />} label="Add Category" onClick={() => setDialogOpen(true)} />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>New category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)} fullWidth variant="outlined">Cancel</Button>
          <Button onClick={handleAdd} disabled={!name.trim() || saving} fullWidth variant="contained">
            {saving ? 'Adding…' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriesPage;
