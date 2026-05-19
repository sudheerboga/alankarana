import { useState } from 'react';
import {
  Box, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { selectCategories, addCategory } from '../../store/slices/categoriesSlice';
import { createWithId } from '../../firebase/firestore';
import { pushToast } from '../../store/slices/uiSlice';
import { COLLECTIONS } from '../../constants';

const OTHER_VALUE = '__add_new__';

/**
 * Category dropdown with built-in "Other..." that opens an inline dialog
 * to create a new category. New categories persist to Firestore and become
 * globally reusable (per spec section 3).
 */
const CategorySelect = ({ value, onChange, label = 'Category', required, fullWidth = true, error, helperText }) => {
  const categories = useSelector(selectCategories);
  const dispatch = useDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSelect = (val) => {
    if (val === OTHER_VALUE) {
      setDialogOpen(true);
      return;
    }
    onChange(val);
  };

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    setSaving(true);
    try {
      // Use slugified name as ID for stability across sessions
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const newCategory = { id, name, custom: true };

      // Optimistic — show it in the list immediately
      dispatch(addCategory(newCategory));
      await createWithId(COLLECTIONS.CATEGORIES, id, newCategory);

      onChange(id);
      dispatch(pushToast({ message: `Added "${name}"`, severity: 'success' }));
      setDialogOpen(false);
      setNewName('');
    } catch (err) {
      console.error(err);
      dispatch(pushToast({ message: 'Could not add category', severity: 'error' }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <TextField
        select
        label={label}
        value={value || ''}
        onChange={(e) => handleSelect(e.target.value)}
        required={required}
        fullWidth={fullWidth}
        error={error}
        helperText={helperText}
      >
        {categories.map((c) => (
          <MenuItem key={c.id} value={c.id}>
            {c.icon && <Box component="span" sx={{ mr: 1 }}>{c.icon}</Box>}
            {c.name}
          </MenuItem>
        ))}
        <MenuItem value={OTHER_VALUE} sx={{ fontStyle: 'italic' }}>
          + Add new category…
        </MenuItem>
      </TextField>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>New category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Category name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)} fullWidth variant="outlined">Cancel</Button>
          <Button onClick={handleAdd} disabled={!newName.trim() || saving} fullWidth variant="contained">
            {saving ? 'Adding…' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CategorySelect;
