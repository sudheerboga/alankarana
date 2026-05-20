import { useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, Typography, Stack, TextField, Button, MenuItem, InputAdornment, Switch, FormControlLabel,
} from '@mui/material';
import { CurrencyRupeeRounded, SaveRounded } from '@mui/icons-material';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import TopBar from '../../components/layout/TopBar';
import ImagePicker from '../../components/common/ImagePicker';
import { useMutation } from '../../hooks/useMutation';
import { useUnsavedChangesGuard } from '../../hooks/useUnsavedChangesGuard';
import { useFormDraft } from '../../hooks/useFormDraft';
import { createExpense } from '../../services/expenseService';
import { useTheme } from '../../theme/ThemeProvider';
import { EXPENSE_TYPES, PAYMENT_TYPES, ROUTES } from '../../constants';

const ExpenseFormPage = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      type: '',
      amount: '',
      date: dayjs().format('YYYY-MM-DD'),
      notes: '',
      isBulkPurchase: false,
      vendorName: '',
      billNumber: '',
      paymentType: 'cash',
      billImage: null,
    },
    mode: 'onBlur',
  });

  useUnsavedChangesGuard('expense-new', isDirty);

  const draft = useFormDraft('expense-new');
  const watched = useWatch({ control });
  const isBulk = watched.isBulkPurchase;

  useEffect(() => {
    const saved = draft.restore();
    if (saved) reset(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isDirty) draft.save(watched);
  }, [watched, isDirty, draft]);

  const save = useMutation(
    async (values) => createExpense({
      ...values,
      date: new Date(values.date),
      // Single-image picker output: take the first image as the bill
      billImage: Array.isArray(values.billImage) && values.billImage.length > 0
        ? values.billImage[0]
        : null,
    }),
    {
      successMessage: 'Expense added',
      errorMessage: 'Could not save expense',
      onSuccess: () => {
        draft.clear();
        navigate(ROUTES.EXPENSES, { replace: true });
      },
    }
  );

  const onSubmit = async (values) => {
    reset(values, { keepValues: true });
    await save.run(values);
  };

  return (
    <Box sx={{ pb: 12 }}>
      <TopBar title="Add Expense" back />

      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 2 }}>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <Stack spacing={2}>
            <Card sx={{ p: 2 }}>
              <Stack spacing={2}>
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: 'Pick a type' }}
                  render={({ field }) => (
                    <TextField {...field} select label="Type" required fullWidth error={!!errors.type} helperText={errors.type?.message}>
                      {EXPENSE_TYPES.map((t) => (
                        <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Controller
                    name="amount"
                    control={control}
                    rules={{ required: 'Required', min: { value: 0, message: 'Invalid' } }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Amount"
                        type="number"
                        required
                        fullWidth
                        error={!!errors.amount}
                        helperText={errors.amount?.message}
                        InputProps={{
                          startAdornment: <InputAdornment position="start"><CurrencyRupeeRounded fontSize="small" /></InputAdornment>,
                        }}
                        inputProps={{ inputMode: 'decimal', min: 0, step: 1 }}
                      />
                    )}
                  />
                  <Controller
                    name="date"
                    control={control}
                    rules={{ required: 'Required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Date"
                        type="date"
                        required
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </Box>
                <Controller
                  name="paymentType"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Payment type" fullWidth>
                      {PAYMENT_TYPES.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                    </TextField>
                  )}
                />
              </Stack>
            </Card>

            {/* Bulk purchase toggle */}
            <Card sx={{ p: 2 }}>
              <Controller
                name="isBulkPurchase"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                    label={
                      <Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.text }}>Bulk wholesale purchase</Typography>
                        <Typography sx={{ fontSize: 12, color: colors.textMuted }}>Track vendor & bill number</Typography>
                      </Box>
                    }
                  />
                )}
              />

              {isBulk && (
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Controller
                    name="vendorName"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Vendor name" fullWidth />
                    )}
                  />
                  <Controller
                    name="billNumber"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Bill number" fullWidth />
                    )}
                  />
                </Stack>
              )}
            </Card>

            <Card sx={{ p: 2 }}>
              <Controller
                name="billImage"
                control={control}
                render={({ field }) => (
                  <ImagePicker
                    label="Bill photo (optional)"
                    value={Array.isArray(field.value) ? field.value : (field.value ? [field.value] : [])}
                    onChange={field.onChange}
                    maxImages={1}
                    folder="bills"
                  />
                )}
              />
            </Card>

            <Card sx={{ p: 2 }}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Notes (optional)" fullWidth multiline minRows={2} maxRows={4} />
                )}
              />
            </Card>
          </Stack>
        </motion.div>
      </Box>

      <Box
        sx={{
          position: 'fixed',
          left: 0, right: 0,
          bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
          p: 2,
          backgroundColor: colors.surface,
          borderTop: `1px solid ${colors.border}`,
          pb: '2.5rem',
          zIndex: 1,
        }}
      >
        <Button
          fullWidth
          variant="contained"
          size="large"
          startIcon={<SaveRounded />}
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting || save.loading}
          sx={{ py: 1.5 }}
        >
          {save.loading ? 'Saving…' : 'Add Expense'}
        </Button>
      </Box>
    </Box>
  );
};

export default ExpenseFormPage;
