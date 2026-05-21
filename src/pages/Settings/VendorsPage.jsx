import { useState } from 'react';
import {
  Box, Card, List, ListItem, ListItemText, IconButton, Typography, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Stack,
} from '@mui/material';
import { AddRounded, DeleteOutlineRounded, EditRounded, StorefrontOutlined } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import TopBar from '../../components/layout/TopBar';
import FAB from '../../components/common/FAB';
import EmptyState from '../../components/common/EmptyState';
import { useCollection } from '../../hooks/useCollection';
import { useMutation } from '../../hooks/useMutation';
import { createVendor, updateVendor, deleteVendor } from '../../services/vendorService';
import { openConfirm } from '../../store/slices/uiSlice';
import { useTheme } from '../../theme/ThemeProvider';
import { COLLECTIONS } from '../../constants';

const VendorsPage = () => {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const [dialog, setDialog] = useState(null); // null | { mode: 'new' | 'edit', vendor }
  const [form, setForm] = useState({ name: '', phone: '', address: '', notes: '' });

  const { items: vendors, loading } = useCollection(COLLECTIONS.VENDORS, { orderBy: [['name', 'asc']] });

  const save = useMutation(
    async () => {
      if (dialog?.mode === 'edit') return updateVendor(dialog.vendor.id, form);
      return createVendor(form);
    },
    {
      successMessage: dialog?.mode === 'edit' ? 'Vendor updated' : 'Vendor added',
      errorMessage: 'Could not save',
      onSuccess: () => { setDialog(null); setForm({ name: '', phone: '', address: '', notes: '' }); },
    }
  );

  const remove = useMutation(deleteVendor, {
    successMessage: 'Vendor deleted',
    errorMessage: 'Could not delete',
  });

  const openNew = () => {
    setForm({ name: '', phone: '', address: '', notes: '' });
    setDialog({ mode: 'new' });
  };

  const openEdit = (vendor) => {
    setForm({
      name: vendor.name || '',
      phone: vendor.phone || '',
      address: vendor.address || '',
      notes: vendor.notes || '',
    });
    setDialog({ mode: 'edit', vendor });
  };

  const handleDelete = (vendor) => {
    dispatch(openConfirm({
      title: `Delete "${vendor.name}"?`,
      message: 'Past expenses tagged to this vendor will keep their reference.',
      confirmLabel: 'Delete',
      severity: 'danger',
      onConfirm: () => remove.run(vendor.id),
    }));
  };

  return (
    <Box sx={{ pb: 10 }}>
      <TopBar title="Vendors" back />
      <Box sx={{ p: 2 }}>
        {loading ? (
          <Stack spacing={1.5}>{[1, 2].map((i) => <Card key={i} sx={{ height: 72, opacity: 0.5 }} />)}</Stack>
        ) : vendors.length === 0 ? (
          <EmptyState
            icon={StorefrontOutlined}
            title="No vendors yet"
            description="Add wholesale suppliers to track bulk purchases."
            actionLabel="Add Vendor"
            onAction={openNew}
          />
        ) : (
          <Card sx={{ overflow: 'hidden' }}>
            <List sx={{ py: 0 }}>
              {vendors.map((v, i) => (
                <ListItem
                  key={v.id}
                  divider={i < vendors.length - 1}
                  sx={{ pr: '96px' }}
                  secondaryAction={
                    <Box>
                      <IconButton onClick={() => openEdit(v)} sx={{ color: colors.textSecondary }}>
                        <EditRounded fontSize="small" />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(v)} sx={{ color: colors.textMuted }}>
                        <DeleteOutlineRounded fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={<Typography sx={{ fontSize: 15, fontWeight: 600, color: colors.text }}>{v.name}</Typography>}
                    secondary={[v.phone, v.address].filter(Boolean).join(' · ')}
                  />
                </ListItem>
              ))}
            </List>
          </Card>
        )}
      </Box>

      <FAB icon={<AddRounded />} label="Add Vendor" onClick={openNew} />

      <Dialog open={!!dialog} onClose={() => setDialog(null)} fullWidth maxWidth="xs">
        <DialogTitle>{dialog?.mode === 'edit' ? 'Edit vendor' : 'New vendor'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth autoFocus />
            <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} fullWidth inputProps={{ inputMode: 'tel' }} />
            <TextField label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} fullWidth multiline minRows={2} />
            <TextField label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} fullWidth multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialog(null)} fullWidth variant="outlined">Cancel</Button>
          <Button onClick={() => save.run()} disabled={!form.name.trim() || save.loading} fullWidth variant="contained">
            {save.loading ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VendorsPage;
