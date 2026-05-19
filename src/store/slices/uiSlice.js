import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
  online: true,
  toasts: [],            // { id, message, severity, duration }
  confirmDialog: null,   // { title, message, confirmLabel, cancelLabel, onConfirm, severity }
  globalLoading: false,
  // Dirty-form tracking — keys are form IDs, values are bool.
  // Used by useUnsavedChangesGuard to warn on navigation.
  dirtyForms: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setOnline(state, action) {
      state.online = action.payload;
    },
    pushToast: {
      reducer(state, action) {
        state.toasts.push(action.payload);
      },
      prepare(toast) {
        return {
          payload: {
            id: nanoid(),
            severity: 'info',
            duration: 3000,
            ...toast,
          },
        };
      },
    },
    dismissToast(state, action) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    openConfirm(state, action) {
      state.confirmDialog = action.payload;
    },
    closeConfirm(state) {
      state.confirmDialog = null;
    },
    setGlobalLoading(state, action) {
      state.globalLoading = action.payload;
    },
    markFormDirty(state, action) {
      state.dirtyForms[action.payload] = true;
    },
    markFormClean(state, action) {
      delete state.dirtyForms[action.payload];
    },
  },
});

export const {
  setOnline,
  pushToast,
  dismissToast,
  openConfirm,
  closeConfirm,
  setGlobalLoading,
  markFormDirty,
  markFormClean,
} = uiSlice.actions;

export const selectOnline = (s) => s.ui.online;
export const selectToasts = (s) => s.ui.toasts;
export const selectConfirmDialog = (s) => s.ui.confirmDialog;
export const selectGlobalLoading = (s) => s.ui.globalLoading;
export const selectHasDirtyForms = (s) => Object.keys(s.ui.dirtyForms).length > 0;

export default uiSlice.reducer;
