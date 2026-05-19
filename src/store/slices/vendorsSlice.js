import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  list: [],
  status: 'idle',
};

const vendorsSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {
    setVendorsLoading(state) { state.status = 'loading'; },
    setVendors(state, action) {
      state.list = action.payload;
      state.status = 'ready';
    },
    upsertVendor(state, action) {
      const idx = state.list.findIndex((v) => v.id === action.payload.id);
      if (idx >= 0) state.list[idx] = action.payload;
      else state.list.push(action.payload);
    },
    removeVendor(state, action) {
      state.list = state.list.filter((v) => v.id !== action.payload);
    },
  },
});

export const { setVendorsLoading, setVendors, upsertVendor, removeVendor } = vendorsSlice.actions;
export const selectVendors = (s) => s.vendors.list;
export const selectVendorById = (id) => (s) => s.vendors.list.find((v) => v.id === id);
export default vendorsSlice.reducer;
