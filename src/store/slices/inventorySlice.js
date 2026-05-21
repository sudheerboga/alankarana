import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  byId: {},
  status: 'idle',         // 'idle' | 'loading' | 'ready' | 'error'
  error: null,
  filters: {
    search: '',
    category: 'all',
    stockStatus: 'all',   // 'all' | 'in_stock' | 'low' | 'out'
    priceRange: 'all',    // 'all' | 'low' | 'mid' | 'high'
    flag: null,           // 'old' | 'new' | 'bestselling' | null
    sort: 'recent',       // 'recent' | 'name' | 'oldest' | 'bestselling'
  },
  lastSyncedAt: null,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setInventoryLoading(state) {
      state.status = 'loading';
    },
    setInventoryItems(state, action) {
      state.items = action.payload;
      state.byId = Object.fromEntries(action.payload.map((i) => [i.id, i]));
      state.status = 'ready';
      state.lastSyncedAt = Date.now();
    },
    upsertItem(state, action) {
      const item = action.payload;
      state.byId[item.id] = item;
      const idx = state.items.findIndex((i) => i.id === item.id);
      if (idx >= 0) state.items[idx] = item;
      else state.items.unshift(item);
    },
    removeItem(state, action) {
      const id = action.payload;
      delete state.byId[id];
      state.items = state.items.filter((i) => i.id !== id);
    },
    setInventoryError(state, action) {
      state.status = 'error';
      state.error = action.payload;
    },
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = initialState.filters;
    },
  },
});

export const {
  setInventoryLoading,
  setInventoryItems,
  upsertItem,
  removeItem,
  setInventoryError,
  setFilters,
  resetFilters,
} = inventorySlice.actions;

export const selectInventoryItems = (s) => s.inventory.items;
export const selectInventoryById = (id) => (s) => s.inventory.byId[id];
export const selectInventoryStatus = (s) => s.inventory.status;
export const selectInventoryFilters = (s) => s.inventory.filters;

export default inventorySlice.reducer;
