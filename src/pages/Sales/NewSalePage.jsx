import { useEffect, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Card, Typography, Stack, TextField, Button, InputAdornment, MenuItem, Divider,
} from '@mui/material';
import { CurrencyRupeeRounded, PointOfSaleRounded } from '@mui/icons-material';
import { motion } from 'framer-motion';
import TopBar from '../../components/layout/TopBar';
import ItemPicker from '../../modules/sales/ItemPicker';
import { useMutation } from '../../hooks/useMutation';
import { useUnsavedChangesGuard } from '../../hooks/useUnsavedChangesGuard';
import { recordSale } from '../../services/salesService';
import { selectUser } from '../../store/slices/authSlice';
import { useTheme } from '../../theme/ThemeProvider';
import { formatINR, computeSaleProfit, toNumber } from '../../utils/format';
import { ROUTES, PAYMENT_TYPES } from '../../constants';

const NewSalePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { colors, typography } = useTheme();
  const user = useSelector(selectUser);

  // Selected item full record (kept in state so we have access to costPerPiece etc.)
  const [selectedItem, setSelectedItem] = useState(null);

  // Preselect via ?itemId=... (from item detail page's "Record a sale" button)
  const presetItemId = searchParams.get('itemId');

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    setValue,
    reset,
  } = useForm({
    defaultValues: {
      itemId: presetItemId || '',
      quantity: 1,
      actualSellingPrice: '',
      discount: 0,
      customerName: '',
      paymentType: 'cash',
      notes: '',
    },
    mode: 'onBlur',
  });

  useUnsavedChangesGuard('sale-new', isDirty);

  const watched = useWatch({ control });

  // When item changes, auto-fill the actual selling price with the default
  const handleItemChange = (id, item) => {
    setSelectedItem(item);
    setValue('itemId', id, { shouldValidate: true });
    if (item) {
      setValue('actualSellingPrice', item.sellingPricePerPiece || '');
    }
  };

  // Live profit preview
  const previewProfit = selectedItem
    ? computeSaleProfit({
        costPerPiece: selectedItem.costPerPiece,
        actualSellingPrice: watched.actualSellingPrice,
        quantity: watched.quantity,
        discount: watched.discount,
      })
    : null;

  const remaining = selectedItem?.remainingPieces ?? 0;
  const qty = toNumber(watched.quantity, 0);
  const overQuantity = qty > remaining;

  const sale = useMutation(
    async (values) => recordSale({ ...values, soldBy: user?.uid }),
    {
      successMessage: 'Sale recorded',
      errorMessage: 'Could not record sale',
      onSuccess: () => navigate(ROUTES.SALES, { replace: true }),
    }
  );

  const onSubmit = async (values) => {
    reset(values, { keepValues: true });
    await sale.run(values);
  };

  return (
    <Box sx={{ pb: 12 }}>
      <TopBar title="New Sale" back />

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 2 }}>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <Stack spacing={2}>
            {/* Item picker */}
            <Card sx={{ p: 2 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Item
              </Typography>
              <Controller
                name="itemId"
                control={control}
                rules={{ required: 'Pick an item' }}
                render={({ field }) => (
                  <ItemPicker
                    value={field.value}
                    onChange={handleItemChange}
                  />
                )}
              />
              {errors.itemId && (
                <Typography sx={{ fontSize: 12, color: colors.danger, mt: 0.75 }}>
                  {errors.itemId.message}
                </Typography>
              )}

              {selectedItem && (
                <Box sx={{ mt: 1.5, p: 1.25, borderRadius: 1.5, backgroundColor: colors.surfaceAlt }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: 12, color: colors.textSecondary }}>Default price</Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: colors.text }}>
                      {formatINR(selectedItem.sellingPricePerPiece)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.25 }}>
                    <Typography sx={{ fontSize: 12, color: colors.textSecondary }}>Cost</Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: colors.text }}>
                      {formatINR(selectedItem.costPerPiece)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.25 }}>
                    <Typography sx={{ fontSize: 12, color: colors.textSecondary }}>In stock</Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: remaining <= 3 ? colors.warning : colors.text }}>
                      {remaining} pieces
                    </Typography>
                  </Box>
                </Box>
              )}
            </Card>

            {/* Sale details */}
            <Card sx={{ p: 2 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Sale details
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Controller
                    name="quantity"
                    control={control}
                    rules={{ required: 'Required', min: { value: 1, message: 'Min 1' } }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Quantity"
                        type="number"
                        required
                        fullWidth
                        error={!!errors.quantity || overQuantity}
                        helperText={errors.quantity?.message || (overQuantity ? `Only ${remaining} left` : ' ')}
                        inputProps={{ inputMode: 'numeric', min: 1 }}
                      />
                    )}
                  />
                  <Controller
                    name="actualSellingPrice"
                    control={control}
                    rules={{ required: 'Required', min: { value: 0, message: 'Invalid' } }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Price / piece"
                        type="number"
                        required
                        fullWidth
                        error={!!errors.actualSellingPrice}
                        helperText={errors.actualSellingPrice?.message || ' '}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><CurrencyRupeeRounded fontSize="small" /></InputAdornment>,
                        }}
                        inputProps={{ inputMode: 'decimal', min: 0, step: 1 }}
                      />
                    )}
                  />
                </Box>

                <Controller
                  name="discount"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Discount (total, optional)"
                      type="number"
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><CurrencyRupeeRounded fontSize="small" /></InputAdornment>,
                      }}
                      inputProps={{ inputMode: 'decimal', min: 0, step: 1 }}
                    />
                  )}
                />

                {/* Live preview */}
                {previewProfit && (
                  <Box sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
                    <Stack spacing={0.75}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: 13, color: colors.textSecondary }}>Total amount</Typography>
                        <Typography sx={{ fontSize: 16, fontWeight: 700, color: colors.primary, fontFamily: typography.fontDisplay }}>
                          {formatINR(previewProfit.totalSale)}
                        </Typography>
                      </Box>
                      <Divider sx={{ borderColor: colors.border }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: 12, color: colors.textMuted }}>Total cost</Typography>
                        <Typography sx={{ fontSize: 13, color: colors.text }}>
                          {formatINR(previewProfit.totalCost)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: 12, color: previewProfit.isLoss ? colors.danger : colors.success, fontWeight: 600 }}>
                          {previewProfit.isLoss ? 'Loss' : 'Profit'}
                        </Typography>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: previewProfit.isLoss ? colors.danger : colors.success }}>
                          {previewProfit.isLoss ? '' : '+'}{formatINR(previewProfit.profit)} ({previewProfit.margin.toFixed(1)}%)
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                )}
              </Stack>
            </Card>

            {/* Customer + payment */}
            <Card sx={{ p: 2 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Customer & payment
              </Typography>
              <Stack spacing={2}>
                <Controller
                  name="customerName"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Customer name (optional)" fullWidth />
                  )}
                />
                <Controller
                  name="paymentType"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Payment type" fullWidth>
                      {PAYMENT_TYPES.map((p) => (
                        <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Notes (optional)" fullWidth multiline minRows={2} maxRows={4} />
                  )}
                />
              </Stack>
            </Card>
          </Stack>
        </motion.div>
      </Box>

      {/* Sticky submit */}
      <Box
        sx={{
          position: 'fixed',
          left: 0, right: 0,
          bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
          p: 2,
          backgroundColor: colors.surface,
          borderTop: `1px solid ${colors.border}`,
          paddingBottom: '2.5rem',
          zIndex: 1
        }}
      >
        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<PointOfSaleRounded />}
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting || sale.loading || overQuantity || !selectedItem}
          sx={{ py: 1.5 }}
        >
          {sale.loading ? 'Recording…' : `Complete Sale${previewProfit ? ` · ${formatINR(previewProfit.totalSale)}` : ''}`}
        </Button>
      </Box>
    </Box>
  );
};

export default NewSalePage;
