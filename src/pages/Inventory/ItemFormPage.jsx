import { useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box, Card, Typography, Stack, TextField, Button, Divider, InputAdornment, IconButton,
} from '@mui/material';
import { CurrencyRupeeRounded, SaveRounded } from '@mui/icons-material';
import { motion } from 'framer-motion';
import TopBar from '../../components/layout/TopBar';
import CategorySelect from '../../components/common/CategorySelect';
import ImagePicker from '../../components/common/ImagePicker';
import { useDoc } from '../../hooks/useDoc';
import { useMutation } from '../../hooks/useMutation';
import { useFormDraft } from '../../hooks/useFormDraft';
import { useUnsavedChangesGuard } from '../../hooks/useUnsavedChangesGuard';
import { createItem, updateItem } from '../../services/inventoryService';
import { pushToast } from '../../store/slices/uiSlice';
import { useTheme } from '../../theme/ThemeProvider';
import { formatINR, toNumber } from '../../utils/format';
import { COLLECTIONS, ROUTES } from '../../constants';

const emptyDefaults = {
  itemName: '',
  category: '',
  costPerPiece: '',
  sellingPricePerPiece: '',
  setQuantity: 1,
  piecesPerSet: 1,
  totalPieces: '',
  notes: '',
  images: [],
};

const ItemFormPage = ({ mode = 'create' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { colors, typography } = useTheme();
  const isEdit = mode === 'edit';

  // Load existing item for edit mode
  const { item: existingItem, loading: loadingItem } = useDoc(
    COLLECTIONS.INVENTORY,
    id,
    { enabled: isEdit }
  );

  // Form draft for create mode only (edit has the live record)
  const draft = useFormDraft(`item-form-${isEdit ? id : 'new'}`);

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
    setValue,
  } = useForm({
    defaultValues: emptyDefaults,
    mode: 'onBlur',
  });

  // Guard navigation if dirty (handles browser back, tab close, route change)
  useUnsavedChangesGuard(`item-form-${id || 'new'}`, isDirty);

  // Populate form: existing item (edit) or saved draft (create)
  useEffect(() => {
    if (isEdit && existingItem) {
      reset({
        itemName: existingItem.itemName ?? '',
        category: existingItem.category ?? '',
        costPerPiece: existingItem.costPerPiece ?? '',
        sellingPricePerPiece: existingItem.sellingPricePerPiece ?? '',
        setQuantity: existingItem.setQuantity ?? 1,
        piecesPerSet: existingItem.piecesPerSet ?? 1,
        totalPieces: existingItem.totalPieces ?? '',
        notes: existingItem.notes ?? '',
        images: existingItem.images ?? [],
      });
    } else if (!isEdit) {
      const saved = draft.restore();
      if (saved) {
        reset(saved);
        dispatch(pushToast({ message: 'Restored unsaved draft', severity: 'info' }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, existingItem]);

  // Live values for previews + auto-save
  const watched = useWatch({ control });

  // Auto-save draft (create mode only — don't shadow Firestore in edit)
  useEffect(() => {
    if (!isEdit && isDirty) draft.save(watched);
  }, [watched, isDirty, isEdit, draft]);

  // Auto-compute totalPieces from set × piecesPerSet, but only when user
  // hasn't typed a totalPieces override
  useEffect(() => {
    const sq = toNumber(watched.setQuantity, 0);
    const pps = toNumber(watched.piecesPerSet, 0);
    if (sq > 0 && pps > 0) {
      setValue('totalPieces', sq * pps, { shouldDirty: false });
    }
  }, [watched.setQuantity, watched.piecesPerSet, setValue]);

  // Live profit preview
  const cost = toNumber(watched.costPerPiece);
  const sell = toNumber(watched.sellingPricePerPiece);
  const profitPerPiece = sell - cost;
  const margin = sell > 0 ? (profitPerPiece / sell) * 100 : 0;
  const totalPieces = toNumber(watched.totalPieces);
  const totalPurchase = cost * totalPieces;
  const expectedRevenue = sell * totalPieces;
  const expectedProfit = profitPerPiece * totalPieces;

  // Save mutation
  const saveMutation = useMutation(
    async (values) => {
      return isEdit ? updateItem(id, values) : createItem(values);
    },
    {
      successMessage: isEdit ? 'Item updated' : 'Item added',
      errorMessage: 'Could not save item',
      onSuccess: (result) => {
        draft.clear();
        navigate(ROUTES.ITEM_DETAIL(result.id), { replace: true });
      },
    }
  );

  const onSubmit = async (values) => {
    // Manually clean dirty state to bypass unsaved guard on navigate
    reset(values, { keepValues: true });
    await saveMutation.run(values);
  };

  if (isEdit && loadingItem) {
    return (
      <Box>
        <TopBar title="Loading…" back />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 12 }}>
      <TopBar title={isEdit ? 'Edit Item' : 'Add Item'} back />

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 2 }}>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <Stack spacing={2}>
            {/* Photos */}
            <Card sx={{ p: 2 }}>
              <Controller
                name="images"
                control={control}
                render={({ field }) => (
                  <ImagePicker value={field.value} onChange={field.onChange} folder="products" />
                )}
              />
            </Card>

            {/* Basic info */}
            <Card sx={{ p: 2 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Basic info
              </Typography>
              <Stack spacing={2}>
                <Controller
                  name="itemName"
                  control={control}
                  rules={{ required: 'Item name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Item Name"
                      fullWidth
                      required
                      error={!!errors.itemName}
                      helperText={errors.itemName?.message}
                      placeholder="e.g. Kanchi Silk Saree"
                    />
                  )}
                />
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: 'Pick a category' }}
                  render={({ field }) => (
                    <CategorySelect
                      value={field.value}
                      onChange={field.onChange}
                      required
                      error={!!errors.category}
                      helperText={errors.category?.message}
                    />
                  )}
                />
              </Stack>
            </Card>

            {/* Pricing */}
            <Card sx={{ p: 2 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Pricing
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Controller
                    name="costPerPiece"
                    control={control}
                    rules={{ required: 'Required', min: { value: 0, message: 'Invalid' } }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Cost / piece"
                        type="number"
                        required
                        fullWidth
                        error={!!errors.costPerPiece}
                        helperText={errors.costPerPiece?.message}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><CurrencyRupeeRounded fontSize="small" /></InputAdornment>,
                        }}
                        inputProps={{ inputMode: 'decimal', min: 0, step: 1 }}
                      />
                    )}
                  />
                  <Controller
                    name="sellingPricePerPiece"
                    control={control}
                    rules={{ required: 'Required', min: { value: 0, message: 'Invalid' } }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Selling / piece"
                        type="number"
                        required
                        fullWidth
                        error={!!errors.sellingPricePerPiece}
                        helperText={errors.sellingPricePerPiece?.message}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><CurrencyRupeeRounded fontSize="small" /></InputAdornment>,
                        }}
                        inputProps={{ inputMode: 'decimal', min: 0, step: 1 }}
                      />
                    )}
                  />
                </Box>

                {/* Live profit preview */}
                {(cost > 0 || sell > 0) && (
                  <Box sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    backgroundColor: profitPerPiece >= 0 ? colors.successBg : colors.dangerBg,
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: 12, color: profitPerPiece >= 0 ? colors.success : colors.danger, fontWeight: 600 }}>
                        {profitPerPiece >= 0 ? 'Profit per piece' : 'Loss per piece'}
                      </Typography>
                      <Typography sx={{ fontSize: 16, fontWeight: 700, color: profitPerPiece >= 0 ? colors.success : colors.danger }}>
                        {profitPerPiece >= 0 ? '+' : ''}{formatINR(profitPerPiece)} ({margin.toFixed(1)}%)
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
            </Card>

            {/* Quantity */}
            <Card sx={{ p: 2 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Quantity
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Controller
                    name="setQuantity"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Sets" type="number" fullWidth inputProps={{ inputMode: 'numeric', min: 1 }} />
                    )}
                  />
                  <Controller
                    name="piecesPerSet"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Per set" type="number" fullWidth inputProps={{ inputMode: 'numeric', min: 1 }} />
                    )}
                  />
                  <Controller
                    name="totalPieces"
                    control={control}
                    rules={{ required: 'Required', min: { value: 1, message: 'Must be ≥ 1' } }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Total"
                        type="number"
                        required
                        fullWidth
                        error={!!errors.totalPieces}
                        helperText={errors.totalPieces?.message}
                        inputProps={{ inputMode: 'numeric', min: 1 }}
                      />
                    )}
                  />
                </Box>

                {totalPieces > 0 && cost > 0 && (
                  <Box sx={{ pt: 1 }}>
                    <Divider sx={{ borderColor: colors.border, mb: 1.5 }} />
                    <Stack spacing={0.75}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: 13, color: colors.textSecondary }}>Total purchase cost</Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{formatINR(totalPurchase)}</Typography>
                      </Box>
                      {sell > 0 && (
                        <>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography sx={{ fontSize: 13, color: colors.textSecondary }}>Expected revenue</Typography>
                            <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{formatINR(expectedRevenue)}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography sx={{ fontSize: 13, color: colors.textSecondary }}>Expected profit</Typography>
                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: expectedProfit >= 0 ? colors.success : colors.danger }}>
                              {expectedProfit >= 0 ? '+' : ''}{formatINR(expectedProfit)}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Card>

            {/* Notes */}
            <Card sx={{ p: 2 }}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Notes (optional)"
                    fullWidth
                    multiline
                    minRows={2}
                    maxRows={4}
                    placeholder="Vendor info, color, size details, etc."
                  />
                )}
              />
            </Card>
          </Stack>
        </motion.div>
      </Box>

      {/* Sticky save button — always reachable */}
      <Box
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
          p: 2,
          backgroundColor: colors.surface,
          borderTop: `1px solid ${colors.border}`,
          boxShadow: '0 -4px 16px rgba(0,0,0,0.05)',
        }}
      >
        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<SaveRounded />}
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting || saveMutation.loading}
          sx={{ py: 1.5 }}
        >
          {saveMutation.loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Item'}
        </Button>
      </Box>
    </Box>
  );
};

export default ItemFormPage;
