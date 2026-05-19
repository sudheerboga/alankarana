import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  recent: [],          // last 50 sales for dashboard / sales page
  status: 'idle',
  filters: {
    dateRange: 'today', // 'today' | 'week' | 'month' | 'custom'
    customStart: null,
    customEnd: null,
    category: 'all',
    paymentType: 'all',
  },
};

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    setSalesLoading(state) { state.status = 'loading'; },
    setRecentSales(state, action) {
      state.recent = action.payload;
      state.status = 'ready';
    },
    addSale(state, action) {
      state.recent.unshift(action.payload);
      if (state.recent.length > 50) state.recent.pop();
    },
    setSalesFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const { setSalesLoading, setRecentSales, addSale, setSalesFilters } = salesSlice.actions;
export const selectRecentSales = (s) => s.sales.recent;
export const selectSalesFilters = (s) => s.sales.filters;
export default salesSlice.reducer;
